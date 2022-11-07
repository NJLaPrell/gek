import * as dotenv from 'dotenv';
// eslint-disable-next-line angular/module-getter
dotenv.config();

import { API } from './lib/api';
import { SubscriptionResource, PlaylistResource, RulesResource, ErrorQueueResource, UnsortedVideosResource, HistoryResource, ErrorQueueItem } from './models/resource.models.js';
import { ResourceLoader } from './lib/resource';
import { Video } from './models/shared/video.model';
import { Rule } from './models/shared/rules.model';

class SortLists {
  private userId: string;
  private api!: API;
  private resources: ResourceLoader;

  private subscriptions!: SubscriptionResource;
  private playlists!: PlaylistResource; 
  private rules!: RulesResource;
  private history!: HistoryResource;
  private errorQueue!: ErrorQueueResource;
  private unsortedVideos!: UnsortedVideosResource;

  private newVideos: Video[] = [];
  private updateQueue: { videoId: string; playlistId: string }[] = [];
  private counts = { processed: 0, errors: { previous: 0, new: 0 }, unsorted: 0 };

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
    return this.subscriptions;
  };

  private getPlaylists = async () => {
    console.log('Gettings playlists...');
    this.playlists = <PlaylistResource>await this.resources.getResource({ name: 'playlists', bypassCache: true });  
    console.log('');
    return this.playlists;
  };

  private getNewVideos = async () => {
    const fromTime = new Date(this.history.lastUpdated).toISOString();
    console.log(`Getting new videos (Since ${fromTime})...`);
    
    // Get new videos for each item in the subscriptionList.
    await Promise.all(
      this.subscriptions.items.map(i => this.api.getChannelFeed(i.channelId, this.history.lastUpdated))
    ).then((feeds) => {
      feeds.forEach(f => this.newVideos = this.newVideos.concat(f));
      console.log(`  ${this.newVideos.length} new videos since ${new Date(this.history.lastUpdated).toISOString()}.`);
      console.log('');
    });
    return this.newVideos;
  };

  private sortVideos = async (videos: Video[]) => {
    if (!videos.length) {
      console.log('  No videos to sort.');
      console.log('');
      return true;
    }

    videos.forEach((v:any) => {
      const playlistId = this.rules.items.find((r: Rule) => {
        const appliedRules: boolean[] = [];
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
        this.updateQueue.push({ videoId: v.id, playlistId: playlistId });
      } else {
        this.unsortedVideos.items.push(v);
      }  
    });
  
    const sortedresults = await Promise.all(
      this.updateQueue.map((q:any) => this.api.addToPlaylist(q.playlistId, q.videoId)
        .then(() => this.counts.processed++)
        .catch((e:any) => {
          this.counts.errors.new++;
          try {
            const req = JSON.parse(e.response.config.body);
            console.log(`  Failed adding videoId: ${req.snippet.resourceId.videoId} to playlistId: ${req.snippet.playlistId}`);
            //console.log('~~~~~~~~~~~~~~~')
            //console.log(e.response.data.error.errors);
            //console.log('~~~~~~~~~~~~~~~')
  
            const video = <Video>this.newVideos.find((v: Video) => v.id === req.snippet.resourceId.videoId);
                     
            // Do not re-add errored videos.
            //if (!history.errorQueue.filter(e => e.videoId === req.snippet.resourceId.videoId)) {
            this.errorQueue.items.push({ videoId: req.snippet.resourceId.videoId, playlistId: req.snippet.playlistId, errors: e.response.data.error.errors, video: video, failDate: Date.now() });
            //}
                      
                      
          } catch(ee) {
            console.log(e);
          }
        })
      )
    );
      
    console.log('');
    return sortedresults;
  };

  private sortUnsortedVideos = async () => {
    this.newVideos = [...this.unsortedVideos.items];
    this.unsortedVideos.items = [];
    console.log('Sorting previously unsorted videos...');
    await this.sortVideos(this.newVideos);
    this.newVideos = [];
    this.updateQueue = [];
  };

  private sortErrorVideos = async () => {
    this.newVideos = <Video[]>[...this.errorQueue.items.map((e: ErrorQueueItem) => e.video)];
    this.counts.errors.previous = this.errorQueue.items.length;
    this.errorQueue.items = [];
    console.log('Sorting previously errored videos...');
    await this.sortVideos(this.newVideos);
    this.updateQueue = [];
    this.newVideos = [];
  };

  private sortNewVideos = async () => {
    console.log('Sorting new videos...');
    await this.sortVideos(this.newVideos);
  };

  public loadAndSort = async (): Promise<boolean> => {
    if (!await this.api.authenticate())
      return false;

    await this.getSubscriptions();
    await this.getPlaylists();
    this.rules = <RulesResource>await this.resources.getResource({ name: 'rules' });
    this.errorQueue = <ErrorQueueResource>await this.resources.getResource({ name: 'errorQueue' });
    this.unsortedVideos = <UnsortedVideosResource>await this.resources.getResource({ name: 'unsortedVideos' });
    this.history = <HistoryResource>await this.resources.getResource({ name: 'history' });
    await this.sortErrorVideos();
    await this.sortUnsortedVideos();
    await this.getNewVideos();
    await this.sortNewVideos();
    
    console.log('Saving run history.');

    this.counts.unsorted = this.unsortedVideos.items.length;

    this.history.lastUpdated = Date.now();
    this.history.sortedCount = this.counts.processed;
    this.history.unsortedCount = this.counts.unsorted;
    this.history.errorCount = this.errorQueue.items.length;

    await this.resources.cacheResource('history', this.history);

    this.errorQueue.lastUpdated = Date.now();
    await this.resources.cacheResource('errorQueue', this.errorQueue);

    this.unsortedVideos.lastUpdated = Date.now();
    await this.resources.cacheResource('unsortedVideos', this.errorQueue);
    
    console.log('');
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log(`Processed: ${this.counts.processed + this.counts.unsorted + this.counts.errors.previous}`);
    console.log(`Sorted:    ${this.counts.processed}`);
    console.log(`Unsorted:  ${this.counts.unsorted}`);
    console.log(`Errors:    ${this.counts.errors.new} New / ${this.errorQueue.items.length} Total`);
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log('');

    return true;
  };

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
