const { loadResource, cacheResource } = require('./lib/resources');
const { authorize, getChannelFeed, getSubscriptionPage, getPlaylistPage, addToPlaylist } = require('./lib/api-calls');

const USE_SUBSCRIPTION_CACHE = true;
const SUBSCRIPTION_CACHE_EXPIRE = 43200000; // 12 Hours
const USE_PLAYLIST_CACHE = false;
const PLAYLIST_CACHE_EXPIRE = 43200000; // 12 Hours
const USE_CACHED_VIDEOS = false;
var subscriptionList = {};
var playlists = {};
var history = {};
var newVideos = [];
var rules = {};
var updateQueue = [];
var counts = { processed: 0, errors: 0, unsorted: 0 };

/**
 * Get subscriptions from cache or API.
 *
 */
async function getSubscriptions() {
    console.log('Getting subscriptions...');
    subscriptionList = await loadResource('subscriptions', USE_SUBSCRIPTION_CACHE, SUBSCRIPTION_CACHE_EXPIRE);
    if (!subscriptionList) {
        const subItems = await getSubscriptionPage();
        subscriptionList = { lastUpdated: Date.now(), items: subItems };
        await cacheResource('subscriptions', subscriptionList);
    }
    console.log('');
};

/**
 * Get playlists from cache or API.
 *
 */
async function getPlaylists() {
    console.log('Gettings playlists...');
    playlists = await loadResource('playlists', USE_PLAYLIST_CACHE, PLAYLIST_CACHE_EXPIRE);

    if (!playlists) {
        const playItems = await getPlaylistPage();
        playlists = { lastUpdated: Date.now(), items: playItems };
        await cacheResource('playlists', playlists)
    }

    console.log('');
};

/**
 * Load the history resource
 *
 */
async function loadHistory() {
    console.log('Loading history...')
    history = await loadResource('history');
    if (!history) {
        history = { lastRun: new Date() - 43200000, errorQueue: [], unsorted: [] };
    }
    history.errorQueue = history.errorQueue || [];
    history.unsorted = history.unsorted || [];
    history.runHistory = history.runHistory || [];
    console.log('');
}
/**
 * Load the rules resource
 *
 */
async function loadRules() {
    rules = await loadResource('rules');
    if (!rules) {
        rules = { rules: [] };
    }
}

/**
 * Adds all videos from each subscription published after history.lastRun to the newVideos list.
 *
 */
 async function getNewVideos() {
    const fromTime = new Date(history.lastRun).toISOString();
    console.log(`Getting new videos (Since ${fromTime})...`);

    // Pull the video list form cache. Only used for debugging.
    if (USE_CACHED_VIDEOS) {
        newVideos = await loadResource('videos');
        console.log('  Using video cache file.');
        console.log('');
        return;
    }

    // Get new videos for each item in the subscriptionList.
    await Promise.all(
        subscriptionList.items.map(i => {
            const title = i.snippet.title;
            const id = i.snippet.resourceId.channelId;
            return getChannelFeed(id, history.lastRun);
        })
    ).then((feeds) => {
        feeds.forEach(f => newVideos = newVideos.concat(f));
        cacheResource('videos', newVideos);
        console.log('');
        console.log(`${newVideos.length} new videos since ${new Date(history.lastRun).toISOString()}.`);
        console.log('');
    });
};

/**
 * Sorts each new video into a playlist based on the rules.
 *
 */
async function sortNewVideos() {
    console.log('Sorting new videos...');
    return await sortVideos(newVideos);
}

/**
 * Sorts each new video into a playlist based on the rules.
 *
 */
 async function sortUnsorted() {
    const unsortedVideos = [...history.unsorted];
    history.unsorted = [];
    console.log('Sorting previously unsorted videos...');
    return await sortVideos(unsortedVideos);
}

/**
 * Sorts each from the given list into a playlist based on the rules.
 *
 */
 async function sortVideos(videos) {
    if (!videos.length) {
        console.log('  No new videos to sort.');
        return true;
    }
    videos.forEach(v => {
        const playlistId = rules.rules.find(r => {
            const appliedRules = [];
            if (r.channelMatch !== '') {
                appliedRules.push(r.channelMatch === v?.channelId)
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
        updateQueue.map(q => addToPlaylist(q.playlistId, q.videoId)
            .then(() => counts.processed++)
            .catch(e => {
                counts.errors++;
                try {
                    const req = JSON.parse(e.response.config.body);
                    console.log(`  Failed adding videoId: ${req.snippet.resourceId.videoId} to playlistId: ${req.snippet.playlistId}`);
                    //console.log('~~~~~~~~~~~~~~~')
                    //console.log(e.response.data.error.errors);
                    //console.log('~~~~~~~~~~~~~~~')

                    const video = newVideos.find(v => v.id === req.snippet.resourceId.videoId);
                    //console.log(video);
                    history.errorQueue.push({ videoId: req.snippet.resourceId.videoId, playlistId: req.snippet.playlistId, errors: e.response.data.error.errors, video: video, failDate: Date.now() });
                } catch(ee) {
                    console.log(e)
                }
            })
        )
    );
    
    console.log('');
}

/**
 * Save the history and log the results.
 *
 */
async function cleanup() {
    console.log('Saving run history.');
    history.lastRun = Date.now();
    history.runHistory.push({
        runDate: Date.now(),
        sortedCount: counts.processed,
        unsortedCound: counts.unsorted,
        errorCount: counts.errors
    })
    cacheResource('history', history);
    console.log('');
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log(`Processed: ${counts.processed + counts.unsorted + counts.errors}`);
    console.log(`Sorted:    ${counts.processed}`);
    console.log(`Unsorted:  ${counts.unsorted}`);
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
    .then(getSubscriptions)
    .then(getPlaylists)
    .then(loadHistory)
    .then(loadRules)
    .then(sortUnsorted)
    .then(getNewVideos)
    .then(sortNewVideos)
    .then(cleanup)
    .catch(console.error);