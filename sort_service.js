const {XMLParser} = require('fast-xml-parser');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const youtube = google.youtube('v3');
const https = require('https');
const { resolve } = require('path');

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

const xmlOptions = {
    ignoreAttributes: false,
    attributeNamePrefix : "@_",
    allowBooleanAttributes: true
};

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtubepartner',
    'https://www.googleapis.com/auth/youtubepartner-channel-audit'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const SUBSCRIPTIONS_PATH = path.join(process.cwd(), 'subscriptions.json');
const PLAYLISTS_PATH = path.join(process.cwd(), 'playlists.json');
const HISTORY_PATH = path.join(process.cwd(), 'history.json');
const RULES_PATH = path.join(process.cwd(), 'rules.json');
const CACHED_VIDEOS_PATH = path.join(process.cwd(), 'videos.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    console.log('  Loading credentials from cache.');
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    console.log('  Caching credentials');
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

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

async function getSubscriptionsFromCache() {
    if (!USE_SUBSCRIPTION_CACHE) {
        console.log('  Bypassing subscription cache.');
        return [];
    }
    try {
        const content = await fs.readFile(SUBSCRIPTIONS_PATH);
        const data = JSON.parse(content);
        if (Date.now() - data.lastUpdated < SUBSCRIPTION_CACHE_EXPIRE) {
            console.log('  Subscriptions retrieved from cache.');
            return data.items;
        } else {
            return [];
        }
    } catch (err) {
        return [];
    }
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




/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    console.log('Authorizing User...')
  let authClient = await loadSavedCredentialsIfExist();

  if (!authClient) {
    console.log('  Triggering user authentication.');
    authClient = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (authClient.credentials) {
        await saveCredentials(authClient);
    }
  }
  console.log('  Authenticated.');
  console.log('');
  google.options({auth: authClient/*, key: API_KEY*/});
  return authClient;
}



async function getSubscriptions() {
    console.log('Getting subscriptions...');
    subscriptionList = await getSubscriptionsFromCache();

    if (!subscriptionList.length) {
        
        await getSubscriptionPage();
        await saveSubscriptions(subscriptionList);
    }

    console.log('');
    
    return subscriptionList;
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
    //console.log(response);
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

async function getNewVideos() {
    const fromTime = new Date(history.lastRun).toISOString();
    console.log(`Getting new videos (Since ${fromTime})...`);

    newVideos = await getVideoListFromCache();
    if (newVideos.length) {
        console.log('  Using video cache file.');
        console.log('');
        return;
    }

    
   await Promise.all(
        subscriptionList.map(i => {
            const title = i.snippet.title;
            const id = i.snippet.resourceId.channelId;
            return getList(id, fromTime);
        })
    ).then(() => {
        cacheVideoList();
        console.log('');
        console.log(`${newVideos.length} new videos since ${new Date(history.lastRun).toISOString()}.`);
        console.log('');
    });
};

async function getList(id, fromTime) {
    return httpsRequest({ host: 'www.youtube.com', path: '/feeds/videos.xml?channel_id=' + id }).then(res => {
        const parser = new XMLParser(xmlOptions);
        const output = parser.parse(res);
        console.log('  Processing ' + output.feed.title);
        (output.feed.entry || []).filter(e => history.lastRun < Date.parse(e.published)).forEach(e => {
            newVideos.push({
              id: e['yt:videoId'],
              channelId: e['yt:channelId'],
              channelName: e.author.name,
              title: e.title,
              published: e.published,
              updated: e.updated,
              description: e['media:group']['media:description']  
            });
        });
    }).catch(e => console.log(e));
}

function httpsRequest(params, postData) {
    return new Promise(function(resolve, reject) {
        var req = https.request(params, function(res) {
            // reject on bad status
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }
            // cumulate data
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });
            // resolve on end
            res.on('end', function() {
                /*
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch(e) {
                    reject(e);
                }
                */
                resolve(body);
            });
        });
        // reject on request error
        req.on('error', function(err) {
            // This is not a "Second reject", just a different sort of failure
            reject(err);
        });
        if (postData) {
            req.write(postData);
        }
        // IMPORTANT
        req.end();
    });
}

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
    .then(getSubscriptions)
    .then(getPlaylists)
    .then(loadHistory)
    .then(loadRules)
    .then(getNewVideos)
    .then(sortNewVideos)
    .then(cleanup)
    .catch(console.error);