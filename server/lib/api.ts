
import { UserAuthentication } from './auth';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

// Options for parsing XML.
const xmlOptions = {
  ignoreAttributes: false,
  attributeNamePrefix : '@_',
  allowBooleanAttributes: true
};


const authorize = async (userId: string): Promise<void> => {
  if (google._options.auth)
    return;
  
  console.log('Authorizing API requests.');
  const auth = new UserAuthentication(userId);
  const authClient = await auth.getAuthClient();
  if (authClient) {
    console.log('  Established oauth2 client.');
    google.options({ auth: authClient });
  } else {
    console.log('  Failed to get oath2 client.');
  }
};









/**
 * Load list of playlists. Supports paging to get the full list.
 *
 * @param {array} playlistList - List of playlists retrieved.
 * @param {string} pageToken - Page token received from the previous call.
 * @return {<Subscription[]>}
 */
export const getPlaylistPage = async (userId: string, playlistList = [], pageToken = '') => {
  await authorize(userId);
  
  console.log('  Calling playlist API.');
  const response = await google.youtube('v3').playlists.list({
    'part': [
      'snippet',
      'contentDetails'
    ],
    'mine': true,
    'maxResults': 50,
    pageToken: pageToken
  });

  playlistList = playlistList.concat(response.data.items.filter(i => i.id !== 'PLLFJ6m60CtDxpqLNqJHUFNyIh0R81jZKa'));
  const nextPageToken = response.data.nextPageToken;
  if (nextPageToken) {
    playlistList = await getPlaylistPage(userId, playlistList, nextPageToken);
  }
  return playlistList;
};


export const listPlaylistItems = async (userId: string, id: string, fromTime = 0) => {
  const items = await getPlaylistItemsPage(id, userId).catch(e => console.log(e)) || [];
  return items.filter((e: any) => fromTime < Date.parse(e.contentDetails.videoPublishedAt)).map((e: any) => ({
    id: e.contentDetails.videoId,
    playlistId: e.id,
    channelId: e.snippet.channelId,
    channelName: e.snippet.channelTitle,
    title: e.snippet.title,
    published: e.snippet.videoPublishedAt,
    description: e.snippet.description,
    thumbnail: e.snippet.thumbnails?.standard?.url || e.snippet.thumbnails?.medium?.url || e.snippet.thumbnails?.default?.url
  }));
};


export const getPlaylistItemsPage = async (userId: string, id: string, videos = [], pageToken = '') => {
  await authorize(userId);

  console.log('  Calling playlist API.');
  const response = await google.youtube('v3').playlistItems.list({
    'part': [
      'snippet,contentDetails,id'
    ],
    'playlistId': id,
    'maxResults': 50,
    pageToken: pageToken
  }).catch(e => console.log('Error calling playlistItems API', e));
  if (response?.data?.items?.length > 0) {
    videos = videos.concat(response.data.items);
    const nextPageToken = response.data.nextPageToken;
    if (nextPageToken) {
      videos = await getPlaylistItemsPage(userId, id, videos, nextPageToken);
    }
  }
  return videos;
};



export const getVideoDetailsPage = async (userId: string, videoIds: string[], videoList = [], pageToken = '') => {
  await authorize(userId);

  console.log('  Calling videos API.');
  const response = await google.youtube('v3').videos.list({
    'part': [
      'snippet,contentDetails,statistics,id'
    ],
    'id': videoIds,
    'maxResults': 50,
    pageToken: pageToken
  });
  videoList = videoList.concat(response.data.items);
  const nextPageToken = response.data.nextPageToken;
  if (nextPageToken) {
    videoList = await getVideoDetailsPage(userId, videoIds, videoList, nextPageToken);
  }
  return videoList;
};

