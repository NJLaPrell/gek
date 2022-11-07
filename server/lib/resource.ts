import { DataStore } from './data-store';
//import { getSortedList } from './resourceLoaders/sorted-list';
import { EmptyResource, HistoryResource, UserResource } from 'server/models/resource.models';
import { API } from './api';

// Returns an empty resource item.
const returnEmptyResource = async (): Promise<EmptyResource> => ({ lastUpdated: Date.now(), items: [] });

const returnEmptyHistory = async (): Promise<HistoryResource> => ({ lastUpdated: Date.now(), sortedCount: 0, unsortedCount: 0, errorCount: 0 });
 

// Map of resources and how to handle them.
const RESOURCES:any = {
  subscriptions: {
    //defaultExpire: 3600000,
  },
  playlists: {
    defaultExpire: 43200000,
    load: async (userId: string) => new API(userId).getPlaylists().then(pl => ({ lastUpdated: Date.now(), items: pl }))
  },
  history: {
    load: returnEmptyHistory
  },
  rules: {
    load: returnEmptyResource
  },
  errorQueue: {
    load: returnEmptyResource
  },
  unsortedVideos: {
    load: returnEmptyResource
  },
  playlist: {
    defaultExpire: 3600000,
    load: async (userId: string, opts: ResourceLoaderOptions) => new API(userId).getPlaylistFeed(opts.resourceId || '', 0, true).then(items => ({ lastUpdated: Date.now(), items }))
  },
  sortedList: {
    defaultExpire: 3600000,
    //load: getSortedList
  }
};

export interface ResourceLoaderOptions {
  name: string;
  expireDuration?: string;
  bypassCache?: boolean;
  resourceId?: string;
}

const defaultOptions = {
  expireDuration: false,
  bypassCache: false
};

export class ResourceLoader {
  private userId: string;
  private store: DataStore;

  constructor(id: string) {
    this.userId = id;
    this.store = new DataStore(id);
  }

  public getResource = (options: ResourceLoaderOptions): Promise<UserResource> => {
    const opts = <ResourceLoaderOptions>{ ...defaultOptions, ...options };
    const resource = RESOURCES[opts.name] || false;
    if (!resource) 
      throw `"${opts.name}" is not a recognized resource.`;
    
    const resourceName = opts.name + (opts.resourceId ? `:${opts.resourceId}` : '');
    return this.store.getResource(resourceName).then((data: UserResource | undefined) => {
      const expireDuration = typeof opts.expireDuration !== undefined ? opts.expireDuration : resource.defaultExpire || false;
      if (
        opts.bypassCache // Bypass the cache.
        || (expireDuration && data?.lastUpdated && (Date.now() - expireDuration) > data?.lastUpdated) // Cached version expired.
        || !data // No data was returned.
      ) {
        console.log('getting current version');
        // Load a current version of the resource.
        return this.loadResource(opts);
      } else {
        console.log('Returning cached version');
        // Return the cached version.
        return data;
      }
    });
  };

  public loadResource = (opts: ResourceLoaderOptions): Promise<UserResource> => {
    const resourceName = opts.name + (opts.resourceId ? `:${opts.resourceId}` : '');
    return RESOURCES[opts.name].load(this.userId, opts).then(((res: UserResource) => this.cacheResource(resourceName, res)));
  };

  public cacheResource = (resourceName: string, data: UserResource): Promise<UserResource> => {
    console.log(`caching resource ${resourceName}`);
    return this.store.saveResource(resourceName, data).then(() => data);
  };

  public updateResourceItem = async (resourceName: string, uniqueIdentifier: string, idValue: string, resourceItem: any) => this.store.updateResourceItem(resourceName, uniqueIdentifier, idValue, resourceItem);
  public deleteResourceItem = async (resourceName: string, uniqueIdentifier: string, idValue: string) => this.store.deleteResourceItem(resourceName, uniqueIdentifier, idValue);
  public addResourceItem = async (resourceName: string, resourceItem: any) => this.store.addResourceItem(resourceName, resourceItem);
  public purgeResourceItem = async (resourceName: string) => this.cacheResource(resourceName, await returnEmptyResource());
}

