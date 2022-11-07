import * as dotenv from 'dotenv';
// eslint-disable-next-line angular/module-getter
dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { loadResource, cacheResource } = require('./lib/resources');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getChannelFeed, getPlaylistPage, addToPlaylist } = require('./lib/api-calls');
import { API } from './lib/api';
import { SubscriptionResource, PlaylistResource, RulesResource, UserResource } from './models/resource.models.js';
import { ResourceLoader } from './lib/resource';




class SortLists {
  private userId: string;
  private api!: API;
  private resources: ResourceLoader;

  private subscriptions!: SubscriptionResource;
  private playlists!: PlaylistResource; 
  private rules!: RulesResource;

  constructor(userId: string) {
    this.userId = userId;
    this.resources = new ResourceLoader(userId);
    this.api = new API(userId);
  }

  private getSubscriptions = async (): Promise<SubscriptionResource> => {
    console.log('Getting subscriptions...');
    const subItems = await this.api.getSubscriptions();
    this.subscriptions = { lastUpdated: Date.now(), items: subItems };
    await this.resources.cacheResource('subscriptions', this.subscriptions);
    console.log('');
    return subscriptionList;
  };

  private getPlaylists = async () => {
    console.log('Gettings playlists...');
    this.playlists = <PlaylistResource>await this.resources.getResource({ name: 'playlists', bypassCache: true });  
    console.log('');
    return this.playlists;
  };

  public loadAndSort = async (): Promise<boolean> => {
    if (!await this.api.authenticate())
      return false;

    await this.getSubscriptions();
    await this.getPlaylists();
    this.rules = <RulesResource>await this.resources.getResource({ name: 'rules' });
    console.log(this.rules);

    return true;
  };

}





const USE_SUBSCRIPTION_CACHE = true;
const SUBSCRIPTION_CACHE_EXPIRE = 43200000; // 12 Hours
const USE_PLAYLIST_CACHE = true;
const PLAYLIST_CACHE_EXPIRE = 43200000; // 12 Hours
const USE_CACHED_VIDEOS = false;
let subscriptionList: SubscriptionResource;
let playlists = {};
let history = { errorQueue: <any>[], unsorted: <any>[], runHistory: <any>[], lastRun:0 };
let newVideos:any = [];
let rules:any;
const updateQueue:any = [];
const counts = { processed: 0, errors: { previous: 0, new: 0 }, unsorted: 0 };



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
    await cacheResource('playlists', playlists);
  }

  console.log('');
  return playlists;
};

/**
 * Load the history resource
 *
 */
async function loadHistory() {
  console.log('Loading history...');
  history = await loadResource('history');
  if (!history) {
    history = { lastRun: Date.now() - 43200000, errorQueue: [], unsorted: [], runHistory: [] };
  }
  history.errorQueue = history.errorQueue || [];
  history.unsorted = history.unsorted || [];
  history.runHistory = history.runHistory || [];
  counts.errors.previous = history.errorQueue.length;
  console.log('');
}
/**
 * Load the rules resource
 *
 */
async function loadRules() {
  console.log('Loading sort rules...');
  rules = await loadResource('rules');
  if (!rules) {
    rules = { rules: [] };
  }
  console.log('');
  return rules;
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
    subscriptionList.items.map(i => getChannelFeed(i.channelId, history.lastRun))
  ).then((feeds) => {
    feeds.forEach(f => newVideos = newVideos.concat(f));
    cacheResource('videos', newVideos);
    console.log(`  ${newVideos.length} new videos since ${new Date(history.lastRun).toISOString()}.`);
    console.log('');
  });
  return newVideos;
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
 * Attempts sorting all error videos.
 *
 */
async function sortErrors() {
  const errorVideos = [...history.errorQueue.map((e:any) => e.video)];
  history.errorQueue = [];
  console.log('Sorting previously errored videos...');
  return await sortVideos(errorVideos);
}

/**
 * Sorts each from the given list into a playlist based on the rules.
 *
 */
async function sortVideos(videos: any) {
  if (!videos.length) {
    console.log('  No videos to sort.');
    console.log('');
    return true;
  }
  videos.forEach((v:any) => {
    const playlistId = rules.rules.find((r:any) => {
      const appliedRules = [];
      if (r.channelMatch !== '') {
        appliedRules.push(r.channelMatch === v?.channelId);
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

  const sortedresults = await Promise.all(
    updateQueue.map((q:any) => addToPlaylist(q.playlistId, q.videoId)
      .then(() => counts.processed++)
      .catch((e:any) => {
        counts.errors.new++;
        try {
          const req = JSON.parse(e.response.config.body);
          console.log(`  Failed adding videoId: ${req.snippet.resourceId.videoId} to playlistId: ${req.snippet.playlistId}`);
          //console.log('~~~~~~~~~~~~~~~')
          //console.log(e.response.data.error.errors);
          //console.log('~~~~~~~~~~~~~~~')

          const video = newVideos.find((v:any) => v.id === req.snippet.resourceId.videoId);
                   
          // Do not re-add errored videos.
          //if (!history.errorQueue.filter(e => e.videoId === req.snippet.resourceId.videoId)) {
          history.errorQueue.push({ videoId: req.snippet.resourceId.videoId, playlistId: req.snippet.playlistId, errors: e.response.data.error.errors, video: video, failDate: Date.now() });
          //}
                    
                    
        } catch(ee) {
          console.log(e);
        }
      })
    )
  );
    
  console.log('');
  return sortedresults;
}

/**
 * Save the history and log the results.
 *
 */
async function cleanup() {
  console.log('Saving run history.');
  history.lastRun = Date.now();
  history.runHistory = history.runHistory.slice(history.runHistory.length - 9);
  history.runHistory.push({
    runDate: Date.now(),
    sortedCount: counts.processed,
    unsortedCound: counts.unsorted,
    errorCount: history.errorQueue.length
  })
  const re = await cacheResource('history', history);
  console.log('');
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log(`Processed: ${counts.processed + counts.unsorted + counts.errors.previous}`);
  console.log(`Sorted:    ${counts.processed}`);
  console.log(`Unsorted:  ${counts.unsorted}`);
  console.log(`Errors:    ${counts.errors.new} New / ${history.errorQueue.length} Total`);
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log('');
  return re;
}

console.log('');
console.log('~~~~~~~~~~~~~~~~~~~~~~~');
console.log('~ Running Sort Service.');
console.log('~~~~~~~~~~~~~~~~~~~~~~~');
console.log('');

const idIx = process.argv.indexOf('-id') + 1;
if(idIx === 0)
  throw '-id argument required.';

const userId = process.argv[idIx];

new SortLists(userId).loadAndSort().then(success => console.log(`Success: ${success}`));

/*
authorize()
  .then(getSubscriptions)
  .then(getPlaylists)
  .then(loadHistory)
  .then(loadRules)
  .then(sortErrors)
  .then(sortUnsorted)
  .then(getNewVideos)
  .then(sortNewVideos)
  .then(cleanup)
  .catch(console.error);

  */