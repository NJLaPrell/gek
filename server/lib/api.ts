
import { UserAuthentication } from './auth';
import { google } from 'googleapis';
import { Subscription, Playlist } from '../models/shared/list.model';
import { httpsRequest } from './utils';
import { XMLParser } from 'fast-xml-parser';
import { Video } from 'server/models/shared/video.model';

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

  /**
   * Authenticate the user.
   * @remarks - Returns true if already authenticated.
   * - Stores the auth client in the API options.
   * @return Boolean success value.
   */
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

  /******************************************
   * CHANNELS
   *****************************************/

  /**
   * Gets the channel data for each channel to which the user is subscribed.
   * @remarks The Google API is called with a paging size of 50 channels.
   * It will continue to get called until all of the subscriptions have been returned.
   * 
   * @returns A subscription list promise.
   */
  public getSubscriptions = async (): Promise<Subscription[]> => this.getSubscriptionPage().then(items => items.map(i => ({
    channelId: i.snippet.resourceId.channelId,
    title: i.snippet.title,
    description: i.snippet.description,
    thumbnail: i.snippet.thumbnails.medium?.url || i.snippet.thumbnails.default?.url,
    newItemCount: i.contentDetails.newItemCount
  })));

  /**
   * Gets a list of videos for the given channel.
   * @param id The Channel ID.
   * @param fromTime Optional epoch to return only videos published afterwards.
   * @returns Video list promise.
   */
  public getChannelFeed = async (id: string, fromTime = 0): Promise<Video[]> => this.getFeed('channel', id, fromTime);

  /******************************************
   * PLAYLIST
   *****************************************/

  /**
   * Gets the list of user playlists.
   * @param fromTime Optional epoch to return only videos published afterwards.
   * @returns Playlist promise.
   */
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

  /**
   * Gets a list of videos for the given playlist.
   * @param id The Playlist ID.
   * @param fromTime Optional epoch to return only videos published afterwards.
   * @ga
   * @returns Video list promise.
   */
  public getPlaylistFeed = async(id: string, fromTime = 0, useGApi = true): Promise<Video[]> => this.getFeed('playlist', id, fromTime, useGApi);

  /**
   * Add a video to a playlist.
   * @param playlistId 
   * @param videoId 
   * @returns Google API response promise.
   */
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

  /******************************************
   * VIDEOS
   *****************************************/

  /**
   * Rate a video.
   * @param videoId 
   * @param rating 'like' | 'dislike' | ''
   * @throws API Error message for client side handling.
   * @returns void
   */
  public rateVideo = async (videoId: string, rating: string) => {
    console.log('  Calling rate video API.');
    await this.checkUserAuth();
    return await this.google.youtube('v3').videos.rate({
      id: videoId,
      rating: rating
    }).catch(e => {
      console.log('Error calling rate video API', e);
      throw { code: 500, message: 'Error calling videos.rate API.' };
    });
  };

  /**
   * Remove a video from a playlist
   * @param playlistItemId 
   * @throws API Error message for client side handling.
   * @returns void
   */
  public removeVideo = async (playlistItemId: string) => {
    console.log('  Calling remove playlist item API.');
    await this.checkUserAuth();
    return await this.google.youtube('v3').playlistItems.delete({
      id: playlistItemId
    }).catch(e => {
      console.log('Error calling remove video API', e);
      throw { code: 500, message: 'Error calling playlistItems.delete API.' };
    });
  };


  /******************************************
   * PRIVATE METHODS
   *****************************************/

  /**
   * Ensures the user is authenticated.
   * @remarks This should be called by every method that calls
   * the Google API to ensure an authentication client is stored
   * for the request.
   * 
   * @throws Error when user cannot be authenticated. It should be
   * handled so that no further API requests are made.
   */
  private checkUserAuth = async (): Promise<void> => {
    if (!await this.authenticate())
      throw `Unable to authenticate user: ${this.userId}.`;
  };

  /**
   * Get the video list for playlists or channels.
   * @remarks Data is pulled from the channel or playlist RSS feed. The playlistItemId
   * is then added by calling the Google API when useGApi is true (default).
   * NOTE: the playlistItemId is required in order to remove an item from the playlist.
   * 
   * @param type 'channel' | 'feed'
   * @param id ID of the channel or feed.
   * @param fromTime Optional epoch to limit videos to videos published afterward.
   * @param useGApi Optional to prevent calling the Google API.
   * @returns 
   */
  private getFeed = async (type: string, id: string, fromTime = 0, useGApi = true): Promise<Video[]> => {
    await this.checkUserAuth();

    // Create a map of data from the Google API to include in the RSS feed response.
    const vmap = <{[key: string]: { playlistId: string; }}>{};
    if (type === 'playlist' && useGApi) {
      await this.listPlaylistItems(id)
        .catch(e => console.log('  Unable to get playlist items from google.', e))
        .then((items) => items.forEach((pl: any) => vmap[pl.id] = pl));
    }
    
    // Get the RSS Feed.
    return httpsRequest({ host: 'www.youtube.com', path: '/feeds/videos.xml?' + type + '_id=' + id }).then((res: any) => {
      const parser = new XMLParser(xmlOptions);
      const output = parser.parse(res);
      console.log(`  Loading ${type} feed: ${output.feed.title} ${fromTime ? ' (From timestamp: ' + String(fromTime) : ''}.`);
      const entries = output?.feed?.entry || Array([]);
            
      return !entries.filter ? [] : entries.filter((e: any) => fromTime < Date.parse(e.published)).map((e: any) => {
        return <Video>{
          videoId: e['yt:videoId'],
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

  /**
   * Formats results from the Google API
   * @param id 
   * @param fromTime 
   * @returns Video list promise
   */
  private listPlaylistItems = async (id: string, fromTime = 0): Promise<any> => {
    const items = await this.getPlaylistItemsPage(id).catch(e => console.log(e)) || [];
    return <any>items.filter((e: any) => fromTime < Date.parse(e.contentDetails.videoPublishedAt)).map((e: any) => ({
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

  /**
   * Paged google API call for playlist items (Videos)
   * @param id videoId
   * @param videos Array of video items returned from previous pages.
   * @param pageToken Google API token to get the next page.
   * @returns Array of Google API response items.
   */
  private getPlaylistItemsPage = async (id: string, videos = [], pageToken = '') => {
    await this.checkUserAuth();
  
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
        videos = await this.getPlaylistItemsPage(id, videos, nextPageToken);
      }
    }
    return videos;
  };

  /**
   * Paged Google API call for user subscriptions.
   * @param subscriptionList Array of subscription items from previous calls.
   * @param pageToken Google API token to get the next page.
   * @returns Array of Google API response items.
   */
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

  /**
   * Paged Google API call for user playlists.
   * @param playlistList Array of playlist items from previous calls.
   * @param pageToken Google API token to get the next page.
   * @returns Array of Google API response items.
   */
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








/*

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



function formatVideoList(videoList) {
  return videoList.map(v => ({
    videoId: v.id,
    publishedAt: v.snippet.publishedAt,
    title: v.snippet.title,
    description: v.snippet.description,
    thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
    channelId: v.snippet.channelId,
    channelTitle: v.snippet.channelTitle,
    duration: v.contentDetails.duration,
    viewCount: v.statistics.viewCount,
    likeCount: v.statistics.likeCount,
    commentCount: v.statistics.commentCount
  }));
}




*/
