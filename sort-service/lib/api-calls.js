const { loadResource, cacheResource } = require('./resources');
const { httpsRequest } = require('./utilities');
const { authenticate } = require('@google-cloud/local-auth');
const { XMLParser } = require('fast-xml-parser');
const { google } = require('googleapis');
const youtube = google.youtube('v3');
const path = require('path');

// Options for parsing XML.
const xmlOptions = {
    ignoreAttributes: false,
    attributeNamePrefix : "@_",
    allowBooleanAttributes: true
};

// Scopes authenticated for the google API.
// NOTE: Delete token.json to reauth if scopes are changed.
// TODO: Remove scopes not needed.
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

// Path to the authentication credentials to authenticate the app.
const CREDENTIALS_PATH = path.join(process.cwd(), 'sort-service/credentials.json');

/**
 * Load or request authorization to call APIs.
 *
 * @return {<BaseExternalAccountClient | OAuth2Client>}
 */
 async function authorize() {
    let authClient;
    console.log('Authorizing User...');

    // Load from cache
    const cachedToken = await loadResource('token', true, false, true);
    if (cachedToken) {
        try {
            console.log('  Loading credentials from cache.');
            authClient = await google.auth.fromJSON(cachedToken);
          } catch (err) {
            console.warn('  Error encountered using cached credentials:');
            console.warn(err);
          }
    }

    // Trigger authentication if unable to authenticate with stored credentails.
    if (!authClient) {
        console.log('  Triggering user authentication.');
        authClient = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        // Cache the credentials.
        if (authClient.credentials) {
            console.log('  Caching credentials');
            const credentails = await loadResource('credentials', true, false, true);
            const key = credentials.installed || credentails.web;
            const payload = {
                type: 'authorized_user',
                client_id: key.client_id,
                client_secret: key.client_secret,
                refresh_token: client.credentials.refresh_token
            };
            await cacheResource('token', payload, false, true);
        }
    }
    console.log('  Authenticated.');
    console.log('');
    // Set the authorization in the google API.
    google.options({auth: authClient});
    return authClient;
};

/**
 * Load feed data.
 *
 * @param {string} type - "playlist" or "channel".
 * @param {string} id - Resource ID.
 * @param {number | false} fromTime - Timestamp after which to return results based on publish date. Default is false.
 * @return {<Promise<ClientRequest>>}
 */
const getFeed = async (type, id, fromTime = false) => httpsRequest({ host: 'www.youtube.com', path: '/feeds/videos.xml?' + type + '_id=' + id }).then(res => {
    console.log('');
    console.log(`Loading ${type} feed: ${id}${fromTime ? ' (From timestamp: ' + String(fromTime) : ''}.`);
    const parser = new XMLParser(xmlOptions);
    const output = parser.parse(res);
    console.log('  Processing ' + output.feed.title);
    return (output.feed.entry || []).filter(e => fromTime < Date.parse(e.published)).map(e => ({
        id: e['yt:videoId'],
        channelId: e['yt:channelId'],
        channelName: e.author.name,
        title: e.title,
        published: e.published,
        updated: e.updated,
        authorName: e.author.name,
        channelLink: e.author.uri,
        link: e.link['@_href'],
        description: e['media:group']['media:description'],
        thumbnail: e['media:group']['media:thumbnail']['@_url'],
        //viewCount: e['media:community']['media:statistics']['@_views'],
        //thumbCount: e['media:community']['media:starRating']['@_count']
        
    }));
}).catch(e => {
    console.error('  Error loading feed:');
    console.error(e);
});

const getChannelFeed = async(id, fromTime = false) => getFeed('channel', id, fromTime);
const getPlaylistFeed = async(id, fromTime = false) => getFeed('playlist', id, fromTime);

module.exports = { authorize, getFeed, getChannelFeed, getPlaylistFeed };