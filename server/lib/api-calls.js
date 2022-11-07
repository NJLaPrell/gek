const { loadResource, cacheResource } = require('./resources');
const { httpsRequest } = require('./utilities');
const { authenticate } = require('@google-cloud/local-auth');
const { XMLParser } = require('fast-xml-parser');
const { google } = require('googleapis');
const youtube = google.youtube('v3');
const path = require('path');
const e = require('express');

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
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtubepartner',
  'https://www.googleapis.com/auth/youtubepartner-channel-audit'
];

// Path to the authentication credentials to authenticate the app.
const CREDENTIALS_PATH = path.join(process.cwd(), 'server/credentials.json');

async function verifyToken(token, client) {
  console.log('  Verifying auth token.');

  const credentails = await loadResource('credentials', true, false, true);
  const key = credentails.installed || credentails.web;

  const ticket = await client.verifyIdToken({ idToken: token.refresh_token, audience: key.client_id })
  const payload = ticket.getPayload();
  const userid = payload['sub'];
}

/**
 * Load or request authorization to call APIs.
 *
 * @return {<BaseExternalAccountClient | OAuth2Client>}
 */
async function authorize() {
  let authClient;
  console.log('Authorizing User...');

  // Load from cache
  console.log('  Loading credentials from cache.');
  const cachedToken = await loadResource('token', true, false, true);
  if (cachedToken) {
    try {
      authClient = await google.auth.fromJSON(cachedToken);   
                  
    } catch (err) {
      console.warn('  Error encountered using cached credentials:');
      console.warn(err);
    }
    /*
          if (authClient) {
            await verifyToken(cachedToken, authClient).catch(e => {
                console.log(e)
                throw 'stop';
            });
          }
          */
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
      const credentials = await loadResource('credentials', true, false, true);
      const key = credentials.installed || credentials.web;
      const payload = {
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: authClient.credentials.refresh_token
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
const getFeed = async (type, id, fromTime = false, useGApi = true) => {
  const vmap = {};
  if (type === 'playlist' && useGApi) {
    const test = await listPlaylistItems(id)
      .catch(e => console.log('  Unable to get playlist items from google.', e))
      .then(items => items.forEach(pl => vmap[pl.id] = pl));
  }
 
  return httpsRequest({ host: 'www.youtube.com', path: '/feeds/videos.xml?' + type + '_id=' + id }).then(res => {
        
    const parser = new XMLParser(xmlOptions);
    const output = parser.parse(res);
    console.log(`  Loading ${type} feed: ${output.feed.title} ${fromTime ? ' (From timestamp: ' + String(fromTime) : ''}.`);
    const entries = output?.feed?.entry || Array([]);
        
    return !entries.filter ? [] : entries.filter(e => fromTime < Date.parse(e.published)).map(e => {
      return {
        id: e['yt:videoId'],
        playlistItemId: vmap[e['yt:videoId']]?.playlistId || '',
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
        viewCount: e['media:group']['media:community']['media:statistics']['@_views'],
        thumbCount: e['media:group']['media:community']['media:starRating']['@_count']        
      }
    });
  }).catch(e => {
    console.error(`  Error loading ${type} feed: ${id}.`);
    console.error(e);
  });
}

const getChannelFeed = async(id, fromTime = false) => getFeed('channel', id, fromTime);
const getPlaylistFeed = async(id, fromTime = false, useGApi = true) => getFeed('playlist', id, fromTime, useGApi);

/**
 * Load list of subscriptions. Supports paging to get the full list.
 *
 * @param {array} subscriptionList - List of subscriptions retrieved.
 * @param {string} pageToken - Page token received from the previous call.
 * @return {<Subscription[]>}
 */
async function getSubscriptionPage(subscriptionList = [], pageToken = '') {
  console.log('  Calling subscriptions API.');
  const response = await youtube.subscriptions.list({
    "part": [
      "snippet,contentDetails"
    ],
    "mine": true,
    "maxResults": 50,
    pageToken: pageToken
  });
  subscriptionList = subscriptionList.concat(response.data.items);
  const nextPageToken = response.data.nextPageToken;
  if (nextPageToken) {
    subscriptionList = await getSubscriptionPage(subscriptionList, nextPageToken);
  }
  return subscriptionList
}

/**
 * Load list of playlists. Supports paging to get the full list.
 *
 * @param {array} playlistList - List of playlists retrieved.
 * @param {string} pageToken - Page token received from the previous call.
 * @return {<Subscription[]>}
 */
async function getPlaylistPage(playlistList = [], pageToken = '') {
  if (!google.options.auth) {
    await authorize();
  }
  console.log('  Calling playlist API.');
  const response = await youtube.playlists.list({
    "part": [
      "snippet",
      "contentDetails"
    ],
    "mine": true,
    "maxResults": 50,
    pageToken: pageToken
  });
  playlistList = playlistList.concat(response.data.items.filter(i => i.id !== 'PLLFJ6m60CtDxpqLNqJHUFNyIh0R81jZKa'));
  const nextPageToken = response.data.nextPageToken;
  if (nextPageToken) {
    playlistList = await getPlaylistPage(playlistList, nextPageToken);
  }
  return playlistList
}

async function addToPlaylist(playlistId, videoId) {
  if (!google.options.auth) {
    await authorize();
  }
  return youtube.playlistItems.insert({
    part: [
      "snippet"
    ],
    resource: {
      snippet: {
        playlistId: playlistId,
        resourceId: {
          kind: "youtube#video",
          videoId: videoId
        }
      }
    }
  });
}

async function listPlaylistItems(id, fromTime = 0) {
  const items = await getPlaylistItemsPage(id).catch(e => console.log(e));
  return items.filter(e => fromTime < Date.parse(e.contentDetails.videoPublishedAt)).map(e => ({
    id: e.contentDetails.videoId,
    playlistId: e.id,
    channelId: e.snippet.channelId,
    channelName: e.snippet.channelTitle,
    title: e.snippet.title,
    published: e.snippet.videoPublishedAt,
    description: e.snippet.description,
    thumbnail: e.snippet.thumbnails?.standard?.url || e.snippet.thumbnails?.medium?.url || e.snippet.thumbnails?.default?.url
  }));
}

/**
 * Load list of videos from a playlistId. Supports paging to get the full list.
 *
 * @param {string} id - PlaylistId.
 * @param {array} videos - List of videos retrieved.
 * @param {string} pageToken - Page token received from the previous call.
 * @return {<Subscription[]>}
 */
async function getPlaylistItemsPage(id, videos = [], pageToken = '') {
  if (!google.options.auth) {
    await authorize();
  }
  console.log('  Calling playlist API.');
  const response = await youtube.playlistItems.list({
    "part": [
      "snippet,contentDetails,id"
    ],
    "playlistId": id,
    "maxResults": 50,
    pageToken: pageToken
  }).catch(e => console.log('Error calling playlistItems API', e));
  if (response?.data?.items?.length > 0) {
    videos = videos.concat(response.data.items);
    const nextPageToken = response.data.nextPageToken;
    if (nextPageToken) {
      videos = await getPlaylistItemsPage(id, videos, nextPageToken);
    }
  }
  return videos
}

/**
 * Rate a video.
 *
 * @param {string} videoId - The videoId to rate.
 * @param {string} rating - like | dislike | none
 */
async function rateVideo(videoId, rating) {
  if (!google.options.auth) {
    await authorize();
  }
  console.log('  Calling rate video API.');
  const response = await youtube.videos.rate({
    "id": videoId,
    "rating": rating
  }).catch(e => console.log('Error calling rate video API', e));
}

/**
 * Remove a video from a playlist
 *
 * @param {string} playlistItemId - The playlistItemId of the video in the playlist.
 */
async function removeVideo(playlistItemId) {
  if (!google.options.auth) {
    await authorize();
  }
  console.log('  Calling remove playlist item API.');
  const response = await youtube.playlistItems.delete({
    "id": playlistItemId
  }).catch(e => console.log('Error calling remove playlist item API', e));
  return response;
}

/**
 * Gets a list of video details for the supplied comma delimited list of videoIds
 *
 * @param {string} videoIds - Comma delimited list of videoIds.
 * @param {string} pageToken - Page token received from the previous call.
 * @return {<Videos[]>}
 */
async function getVideoDetailsPage(videoIds, videoList = [], pageToken = '') {
  console.log('  Calling videos API.');
  const response = await youtube.videos.list({
    "part": [
      "snippet,contentDetails,statistics,id"
    ],
    "id": videoIds,
    "maxResults": 50,
    pageToken: pageToken
  });
  videoList = videoList.concat(response.data.items);
  const nextPageToken = response.data.nextPageToken;
  if (nextPageToken) {
    videoList = await getVideoDetailsPage(videoIds, videoList, nextPageToken);
  }
  return videoList
}

module.exports = { authorize, getFeed, getChannelFeed, getPlaylistFeed, getSubscriptionPage, getPlaylistPage, addToPlaylist, rateVideo, removeVideo, getPlaylistItemsPage, getVideoDetailsPage };