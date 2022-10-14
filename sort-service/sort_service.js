const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {google} = require('googleapis');
const youtube = google.youtube('v3');
const { loadResource } = require('./lib/resources');
const { authorize, getChannelFeed } = require('./lib/api-calls');


const USE_SUBSCRIPTION_CACHE = true;
const SUBSCRIPTION_CACHE_EXPIRE = 43200000; // 12 Hours
const USE_PLAYLIST_CACHE = true;
const PLAYLIST_CACHE_EXPIRE = 43200000; // 12 Hours
const USE_CACHED_VIDEOS = false;
var subscriptionList = [];
var playlists = [];
var history = {};
var newVideos = [];
var rules = {};
var updateQueue = [];
var counts = { processed: 0, errors: 0, unsorted: 0 };

const SUBSCRIPTIONS_PATH = path.join(process.cwd(), 'sort-service/state/subscriptions.json');
const PLAYLISTS_PATH = path.join(process.cwd(), 'sort-service/state/playlists.json');
const HISTORY_PATH = path.join(process.cwd(), 'sort-service/state/history.json');
const RULES_PATH = path.join(process.cwd(), 'sort-service/state/rules.json');
const CACHED_VIDEOS_PATH = path.join(process.cwd(), 'sort-service/state/videos.json');

async function saveSubscriptions(items) {
    console.log('  Caching subscriptions');
    const content = await fs.readFile(SUBSCRIPTIONS_PATH);
    const data = {
        lastUpdated: Date.now(),
        items: items
    }
    const payload = JSON.stringify(data);
    await fs.writeFile(SUBSCRIPTIONS_PATH, payload);
}

async function savePlaylists(items) {
    console.log('  Caching playlists.');
    const content = await fs.readFile(PLAYLISTS_PATH);
    const data = {
        lastUpdated: Date.now(),
        items: items
    }
    const payload = JSON.stringify(data);
    await fs.writeFile(PLAYLISTS_PATH, payload);
}

async function getPlaylistsFromCache() {
    if (!USE_PLAYLIST_CACHE) {
        console.log('  Bypassing playlist cache.');
        return false;
    }
    try {
        const content = await fs.readFile(PLAYLISTS_PATH);
        const data = JSON.parse(content);
        if (Date.now() - data.lastUpdated < PLAYLIST_CACHE_EXPIRE) {
            console.log('  Playlists retrieved from cache.');
            return data.items;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

async function getVideoListFromCache() {
    if (!USE_CACHED_VIDEOS) {
        return [];
    }
    try {
        const content = await fs.readFile(CACHED_VIDEOS_PATH);
        return JSON.parse(content);
    } catch (err) {
        return [];
    }
}

async function cacheVideoList() {
    console.log('  Caching video list.');
    const payload = JSON.stringify(newVideos);
    await fs.writeFile(CACHED_VIDEOS_PATH, payload);
}

async function loadHistory() {
    try {
        const content = await fs.readFile(HISTORY_PATH);
        history = JSON.parse(content);
        if (!history.lastRun) {
            history.lastRun = new Date() - 43200000;
        }
        history.errorQueue = history.errorQueue || [];
        history.unsorted = history.unsorted || [];
    } catch (err) {
        history = { lastRun: new Date() - 43200000, errorQueue: [], unsorted: [] };
    }
}

async function saveHistory() {
    console.log('Saving run history.');
    const payload = JSON.stringify(history);
    await fs.writeFile(HISTORY_PATH, payload);
}

async function loadRules() {
    try {
        const content = await fs.readFile(RULES_PATH);
        rules = JSON.parse(content);
    } catch (err) {
        rules = {};
    }
}

async function getSubscriptions() {
    console.log('Getting subscriptions...');

    cachedSubscriptions = await loadResource('subscriptions', USE_SUBSCRIPTION_CACHE, SUBSCRIPTION_CACHE_EXPIRE);

    if (cachedSubscriptions) {
        subscriptionList = cachedSubscriptions.items;
    } else {
        await getSubscriptionPage();
        await saveSubscriptions(subscriptionList);
    }
    console.log('');
};

async function getSubscriptionPage(pageToken = '') {
    console.log('  Calling subscriptions API.');
    const response = await youtube.subscriptions.list({
        "part": [
            "snippet"
        ],
        "mine": true,
        "maxResults": 500,
        pageToken: pageToken
    });
    subscriptionList = subscriptionList.concat(response.data.items);
    const nextPageToken = response.data.nextPageToken;
    if (nextPageToken) {
        await getSubscriptionPage(nextPageToken);
    }
}

async function getPlaylists() {
    console.log('Gettings playlists...')
    playlists = await getPlaylistsFromCache();

    if (!playlists) {
        console.log('  Calling playlist API.');
        const response = await youtube.playlists.list({
            "part": [
                "snippet"
            ],
            "mine": true,
            "maxResults": 500
        });
        playlists = response.data.items;
        await savePlaylists(playlists);
    }

    console.log('');
    
    return playlists;
};

/**
 * Adds all videos from each subscription published after history.lastRun to the newVideos list.
 *
 */
async function getNewVideos() {
    const fromTime = new Date(history.lastRun).toISOString();
    console.log(`Getting new videos (Since ${fromTime})...`);

    // Pull the video list form cache. Only used for debugging.
    newVideos = await getVideoListFromCache();
    if (newVideos.length) {
        console.log('  Using video cache file.');
        console.log('');
        return;
    }

    // Get new videos for each item in the subscriptionList.
    await Promise.all(
        subscriptionList.map(i => {
            const title = i.snippet.title;
            const id = i.snippet.resourceId.channelId;
            return getChannelFeed(id, history.lastRun);
        })
    ).then((feeds) => {
        feeds.forEach(f => newVideos = newVideos.concat(f));
        cacheVideoList();
        console.log('');
        console.log(`${newVideos.length} new videos since ${new Date(history.lastRun).toISOString()}.`);
        console.log('');
    });
};

async function sortNewVideos() {
    if (!newVideos.length) {
        return true;
    }
    console.log('Sorting new videos...');
    newVideos.forEach(v => {
        const playlistId = rules.rules.find(r => {
            const appliedRules = [];
            if (r.channelMatch !== '') {
                appliedRules.push(r.channelMatch === v.channelId)
            }
            if (r.titleMatch !== '') {
                appliedRules.push(new RegExp(r.titleMatch).test(v.title));
            }
            if (r.descriptionMatch !== '') {
                appliedRules.push(new RegExp(r.descriptionMatch).test(v.description));
            }
            return r.type === 'or' ? appliedRules.some(t => t) : appliedRules.every(t => t);
        })?.playlistId;
        if (playlistId) {
            updateQueue.push({ videoId: v.id, playlistId: playlistId });
        } else {
            history.unsorted.push(v);
            counts.unsorted++;
        }
        
    });

    await Promise.all(
        updateQueue.map(q => youtube.playlistItems.insert({
                part: [
                    "snippet"
                ],
                resource: {
                    snippet: {
                        playlistId: q.playlistId,
                        resourceId: {
                            kind: "youtube#video",
                            videoId: q.videoId
                        }
                    }
                }
            }).then(() => counts.processed++).catch(e => {
                counts.errors++;
                const req = JSON.parse(e.response.config.body);
                console.log(`  Failed adding videoId: ${req.snippet.resourceId.videoId} to playlistId: ${req.snippet.playlistId}`);
                history.errorQueue.push({ videoId: req.snippet.resourceId.videoId, playlistId: req.snippet.playlistId, errors: e.response.errors })
            })
        )
    );
    
    console.log('');
    return true;
}

async function cleanup() {
    history.lastRun = Date.now();
    await saveHistory();
    console.log('');
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log(`Processed: ${counts.processed + counts.unsorted + counts.errors}`);
    console.log(`Sorted:    ${counts.processed}`);
    console.log(`Unsorted:  ${counts.processed} (${history.unsorted.length} Total)`);
    console.log(`Errors:    ${counts.errors} (${history.errorQueue.length} Total)`);
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('');
}

console.log('');
console.log('~~~~~~~~~~~~~~~~~~~~~~~');
console.log('~ Running Sort Service.');
console.log('~~~~~~~~~~~~~~~~~~~~~~~');
console.log('');
authorize()
    .then(authClient => google.options({auth: authClient}))
    .then(getSubscriptions)
    .then(getPlaylists)
    .then(loadHistory)
    .then(loadRules)
    .then(getNewVideos)
    .then(sortNewVideos)
    .then(cleanup)
    .catch(console.error);