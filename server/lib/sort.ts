import { API } from './api';
import { SubscriptionResource, PlaylistResource, RulesResource, ErrorQueueResource, UnsortedVideosResource, HistoryResource, ErrorQueueItem } from '../models/resource.models.js';
import { ResourceLoader } from './resource';
import { Video } from '../models/shared/video.model';
import { Rule } from '../models/shared/rules.model';
import { Logger } from './logger';

const log = new Logger('sort');

export class SortLists {
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

  private statusCallbacks: ((status: string) => any)[] = [];

  constructor(userId: string) {
    this.userId = userId;
    this.resources = new ResourceLoader(userId, log);
    this.api = new API(userId, log);
  }

  private getSubscriptions = async (): Promise<SubscriptionResource | false> => {
    this.writeStatus('Getting subscriptions...');
    const subItems = await this.api.getSubscriptions().catch(e => this.handleException('getting subscriptions', e));
    if (!subItems) return false;

    this.subscriptions = { lastUpdated: Date.now(), items: subItems };
    await this.resources.cacheResource('subscriptions', this.subscriptions).catch(e => this.handleException('caching subscriptions', e));
    this.writeStatus('');
    return this.subscriptions;
  };

  private getPlaylists = async (): Promise<PlaylistResource | false> => {
    this.writeStatus('Gettings playlists...');
    this.playlists = <PlaylistResource>await this.resources.getResource({ name: 'playlists', bypassCache: true }).catch(e => this.handleException('getting playlists', e));
    this.writeStatus('');
    return this.playlists;
  };

  private getNewVideos = async () => {
    const fromTime = new Date(this.history.lastUpdated).toISOString();
    this.writeStatus(`Getting new videos (Since ${fromTime})...`);

    // Get new videos for each item in the subscriptionList.
    await Promise.all(this.subscriptions.items.map(i => this.api.getChannelFeed(i.channelId, this.history.lastUpdated).catch(e => this.handleException('getting channel feed', e, true)))).then(
      feeds => {
        feeds.forEach(f => (this.newVideos = this.newVideos.concat(f || [])));
        this.writeStatus(`  ${this.newVideos.length} new videos since ${new Date(this.history.lastUpdated).toISOString()}.`);
        this.writeStatus('');
      }
    );
    return this.newVideos;
  };

  private sortVideos = async (videos: Video[]) => {
    if (!videos.length) {
      this.writeStatus('  No videos to sort.');
      this.writeStatus('');
      return true;
    }

    videos.forEach((v: any) => {
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
        this.updateQueue.push({ videoId: v.videoId, playlistId: playlistId });
      } else {
        this.unsortedVideos.items.push(v);
      }
    });

    const sortedresults = await this.threadedSort(this.updateQueue);

    /*
    const sortedresults = await Promise.all(
      this.updateQueue.map((q:any) => this.api.addToPlaylist(q.playlistId, q.videoId)
        .then(() => this.counts.processed++)
        .catch((e:any) => {
          this.counts.errors.new++;
          this.handleException('sorting video', e, true);
          try {
            const req = JSON.parse(e.response.config.body);
            this.writeStatus(`  Failed adding videoId: ${req.snippet.resourceId.videoId} to playlistId: ${req.snippet.playlistId}`);  
            const video = <Video>this.newVideos.find((v: Video) => v.videoId === req.snippet.resourceId.videoId);
            this.errorQueue.items.push({ videoId: req.snippet.resourceId.videoId, playlistId: req.snippet.playlistId, errors: e.response.data.error.errors, video: video, failDate: Date.now() });       
          } catch(e:any) {
            this.handleException('adding video to the error queue', e, true);
          }
        })
      )
    );
    */

    this.writeStatus('');
    return sortedresults;
  };

  private threadedSort = async (queue: any, threads = 2, results: any[] = []): Promise<any> => {
    let thread = 1;
    const jobQueue = [];
    while (thread <= threads && queue.length) {
      const q = queue.pop();
      jobQueue.push(
        this.api
          .addToPlaylist(q.playlistId, q.videoId)
          .then(() => this.counts.processed++)
          .catch((e: any) => {
            this.counts.errors.new++;
            this.handleException('sorting video', e, true);
            try {
              const req = JSON.parse(e.response.config.body);
              this.writeStatus(`  Failed adding videoId: ${req.snippet.resourceId.videoId} to playlistId: ${req.snippet.playlistId}`);
              const video = <Video>this.newVideos.find((v: Video) => v.videoId === req.snippet.resourceId.videoId);
              this.errorQueue.items.push({ videoId: req.snippet.resourceId.videoId, playlistId: req.snippet.playlistId, errors: e.response.data.error.errors, video: video, failDate: Date.now() });
            } catch (e: any) {
              this.handleException('adding video to the error queue', e, true);
            }
          })
      );
      thread++;
    }

    const sortedresults = await Promise.all(jobQueue);
    results = results.concat(sortedresults || []);

    if (queue.length) {
      return await this.threadedSort(queue, threads, results);
    } else {
      return results;
    }
  };

  private sortUnsortedVideos = async () => {
    this.newVideos = [...this.unsortedVideos.items];
    this.unsortedVideos.items = [];
    this.writeStatus('Sorting previously unsorted videos...');
    await this.sortVideos(this.newVideos);
    this.newVideos = [];
    this.updateQueue = [];
  };

  private sortErrorVideos = async () => {
    this.newVideos = <Video[]>[...this.errorQueue.items.map((e: ErrorQueueItem) => e.video)];
    this.counts.errors.previous = this.errorQueue.items.length;
    this.errorQueue.items = [];
    this.writeStatus('Sorting previously errored videos...');
    await this.sortVideos(this.newVideos);
    this.updateQueue = [];
    this.newVideos = [];
  };

  private sortNewVideos = async () => {
    this.writeStatus('Sorting new videos...');
    await this.sortVideos(this.newVideos);
  };

  private writeStatus = (status: string) => {
    log.debug(status);
    this.statusCallbacks.forEach(cb => cb(status + '\n'));
  };

  private handleException(task: string, exception: Error, warning = false): void {
    const errorType = warning ? 'WARNING' : 'ERROR';
    const logMsg = `Exception caught while ${task}.`;
    (warning ? log.warn : log.error)(logMsg, exception);
    this.writeStatus(`${errorType}: Error encountered while ${task},`);
  }

  public onStatus = (func: (status: string) => any) => {
    this.statusCallbacks.push(func);
  };

  public loadAndSort = async (): Promise<boolean> => {
    this.writeStatus('');
    this.writeStatus('~~~~~~~~~~~~~~~~~~~~~~~');
    this.writeStatus('~ Running Sort Service.');
    this.writeStatus('~~~~~~~~~~~~~~~~~~~~~~~');
    this.writeStatus('');

    if (!(await this.api.authenticate())) return false;

    if (!(await this.getSubscriptions())) return false;

    await this.getPlaylists();
    if (!this.playlists.lastUpdated) return false;

    this.rules = <RulesResource>await this.resources.getResource({ name: 'rules' }).catch(e => this.handleException('getting rules', e, true));
    if (!this.rules.lastUpdated) log.warn('No rules to process.');

    this.errorQueue = <ErrorQueueResource>await this.resources.getResource({ name: 'errorQueue' }).catch(e => this.handleException('getting the error queue', e, true));
    this.unsortedVideos = <UnsortedVideosResource>await this.resources.getResource({ name: 'unsortedVideos' }).catch(e => this.handleException('getting unsorted videos', e, true));
    this.history = <HistoryResource>await this.resources.getResource({ name: 'history' }).catch(e => this.handleException('getting run history', e, true));
    await this.sortErrorVideos();
    await this.sortUnsortedVideos();
    await this.getNewVideos();
    await this.sortNewVideos();

    this.writeStatus('Saving run history.');

    this.counts.unsorted = this.unsortedVideos.items.length;

    this.history.lastUpdated = Date.now();
    this.history.sortedCount = this.counts.processed;
    this.history.unsortedCount = this.counts.unsorted;
    this.history.errorCount = this.errorQueue.items.length;

    await this.resources.cacheResource('history', this.history).catch(e => this.handleException('caching run history', e, true));

    this.errorQueue.lastUpdated = Date.now();
    await this.resources.cacheResource('errorQueue', this.errorQueue).catch(e => this.handleException('caching error queue', e, true));

    this.unsortedVideos.lastUpdated = Date.now();
    await this.resources.cacheResource('unsortedVideos', this.unsortedVideos).catch(e => this.handleException('caching unsorted list', e, true));

    this.writeStatus('');
    this.writeStatus('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    this.writeStatus(`Processed: ${this.counts.processed + this.counts.unsorted + this.counts.errors.previous}`);
    this.writeStatus(`Sorted:    ${this.counts.processed}`);
    this.writeStatus(`Unsorted:  ${this.counts.unsorted}`);
    this.writeStatus(`Errors:    ${this.counts.errors.new} New / ${this.errorQueue.items.length} Total`);
    this.writeStatus('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    this.writeStatus('');

    return true;
  };
}
