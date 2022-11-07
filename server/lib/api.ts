
import { UserAuthentication } from './auth';
import { google } from 'googleapis';
import { Subscription, Playlist } from '../models/shared/list.model';
import { httpsRequest } from './utils';
import { XMLParser } from 'fast-xml-parser';
import { Video } from 'server/models/shared/video.model';

const youtube = google.youtube('v3');

// Options for parsing XML.
const xmlOptions = {
  ignoreAttributes: false,
  attributeNamePrefix : '@_',
  allowBooleanAttributes: true
};

export class API {
  private userId: string;
  private google = google;

  constructor(userId: string) {
    this.userId = userId;
  }

  public authenticate = async (): Promise<boolean> => {
    if (this.google._options.auth)
      return true;

    console.log('Authorizing API requests.');
    const auth = new UserAuthentication(this.userId);
    const authClient = await auth.getAuthClient();
    if (authClient) {
      console.log('  Established oauth2 client.');
      this.google.options({ auth: authClient });
      return true;
    } else {
      console.log('  Failed to get oath2 client.');
      return false;
    }
  };

  public getSubscriptions = async (): Promise<Subscription[]> => this.getSubscriptionPage().then(items => items.map(i => ({
    channelId: i.snippet.resourceId.channelId,
    title: i.snippet.title,
    description: i.snippet.description,
    thumbnail: i.snippet.thumbnails.medium?.url || i.snippet.thumbnails.default?.url,
    newItemCount: i.contentDetails.newItemCount
  })));

  public getPlaylists = async (fromTime = 0): Promise<Playlist[]> => this.getPlaylistPage().then(items => 
    <Playlist[]>items.filter((e: any) => fromTime <= Date.parse(e.snippet.publishedAt)).map((e: any) => (<Playlist>{
      playlistId: e.id,
      title: e.snippet.title,
      description: e.snippet.description,
      thumbnail: e.snippet.thumbnails?.standard?.url || e.snippet.thumbnails?.medium?.url || e.snippet.thumbnails?.default?.url,
      newItemCount: 0,
      itemCount: e.contentDetails.itemCount,
      videos: [],
      channelId: e.snippet.channelId,
      channelName: e.snippet.title,
      publishedDate: e.snippet.publishedAt
    })));

  public getChannelFeed = async (id: string, fromTime = 0) => this.getFeed('channel', id, fromTime);
  public getPlaylistFeed = async(id: string, fromTime = 0, useGApi = true) => this.getFeed('playlist', id, fromTime, useGApi);

  public addToPlaylist = async (playlistId: string, videoId: string) => {
    await this.checkUserAuth();

    return await this.google.youtube('v3').playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId
          }
        }
      }
    });
  };



  private getFeed = async (type: string, id: string, fromTime = 0, useGApi = true) => {
    await this.checkUserAuth();

    const vmap = <{[key: string]: { playlistId: string; }}>{};
    /*
    if (type === 'playlist' && useGApi) {
      const test = await listPlaylistItems(id)
        .catch(e => console.log('  Unable to get playlist items from google.', e))
        .then(items => items.forEach(pl => vmap[pl.id] = pl));
    }
    */
     
    return httpsRequest({ host: 'www.youtube.com', path: '/feeds/videos.xml?' + type + '_id=' + id }).then((res: any) => {
      const parser = new XMLParser(xmlOptions);
      const output = parser.parse(res);
      console.log(`  Loading ${type} feed: ${output.feed.title} ${fromTime ? ' (From timestamp: ' + String(fromTime) : ''}.`);
      const entries = output?.feed?.entry || Array([]);
            
      return !entries.filter ? [] : entries.filter((e: any) => fromTime < Date.parse(e.published)).map((e: any) => {
        return <Video>{
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
        };
      });
    }).catch(e => {
      console.error(`  Error loading ${type} feed: ${id}.`);
      console.error(e);
    });
  };








  private checkUserAuth = async (): Promise<void> => {
    if (!await this.authenticate())
      throw `Unable to authenticate user: ${this.userId}.`;
  };


  private getSubscriptionPage = async (subscriptionList:any = [], pageToken = ''): Promise<any[]> => {
    console.log('  Calling subscriptions API.');
    await this.checkUserAuth();

    const response = await this.google.youtube('v3').subscriptions.list({
      part: ['snippet,contentDetails'],
      mine: true,
      maxResults: 50,
      pageToken: pageToken
    });
    subscriptionList = subscriptionList.concat(<any>response.data.items);
    const nextPageToken = response.data.nextPageToken;
    if (nextPageToken) {
      subscriptionList = await this.getSubscriptionPage(subscriptionList, nextPageToken);
    }
    return subscriptionList;
  };

  private getPlaylistPage = async (playlistList:any = [], pageToken = ''): Promise<any[]> => {
    console.log('  Calling playlist API.');
    await this.checkUserAuth();

    const response = await this.google.youtube('v3').playlists.list({
      part: [
        'snippet',
        'contentDetails'
      ],
      mine: true,
      maxResults: 50,
      pageToken: pageToken
    });
    playlistList = playlistList.concat(<any>(response.data.items || []).filter(i => i.id !== 'PLLFJ6m60CtDxpqLNqJHUFNyIh0R81jZKa'));
    
    const nextPageToken = response.data.nextPageToken;
    if (nextPageToken) {
      playlistList = await this.getPlaylistPage(playlistList, nextPageToken);
    }
    return playlistList;
  };

}


export const authorize = async (userId: string): Promise<void> => {
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

  playlistList = playlistList.concat(<any>(response.data.items || []).filter(i => i.id !== 'PLLFJ6m60CtDxpqLNqJHUFNyIh0R81jZKa'));
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
  if (response?.data?.items?.length || 0 > 0) {
    videos = videos.concat(response ? <any>response.data.items : []);
    const nextPageToken = response ? response.data.nextPageToken : '';
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
  videoList = videoList.concat(<any>response.data.items);
  const nextPageToken = response.data.nextPageToken;
  if (nextPageToken) {
    videoList = await getVideoDetailsPage(userId, videoIds, videoList, nextPageToken);
  }
  return videoList;
};

