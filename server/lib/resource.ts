import * as path from 'path';
import { DataStore } from './data-store';
//import { getSortedList } from './resourceLoaders/sorted-list';
import { EmptyResource, UserResource } from 'server/models/resource.models';
import { API } from './api';

// Returns an empty resource item.
const returnEmptyResource = async (): Promise<EmptyResource> => ({ lastUpdated: Date.now(), items: [] });

// Map of resources and how to handle them.
const RESOURCES:any = {
  token: {
    path: path.join(process.cwd(), 'server/token.json'),
    protected: true
  },
  credentials: {
    path: path.join(process.cwd(), 'server/credentials.json'),
    protected: true
  },
  subscriptions: {
    path: path.join(process.cwd(), 'server/state/subscriptions.json'),
    //defaultExpire: 3600000,
    protected: false
  },
  playlists: {
    path: path.join(process.cwd(), 'server/state/playlists.json'),
    defaultExpire: 43200000,
    load: async (userId: string) => new API(userId).getPlaylists().then(pl => ({ lastUpdated: Date.now(), items: pl }))
  },
  history: {
    path: path.join(process.cwd(), 'server/state/history.json'),
    protected: false
  },
  rules: {
    path: path.join(process.cwd(), 'server/state/rules.json'),
    load: returnEmptyResource
  },
  videos: {
    path: path.join(process.cwd(), 'server/state/videos.json'),
    protected: false
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
    console.log(`getResource(${JSON.stringify(options)})`);
    const opts = { ...defaultOptions, ...options };
    const resource = RESOURCES[opts.name] || false;
    if (!resource) 
      throw `"${opts.name}" is not a recognized resource.`;
    
    return this.store.getResource(opts.name).then((data: UserResource | undefined) => {
      const expireDuration = typeof opts.expireDuration !== undefined ? opts.expireDuration : resource.defaultExpire || false;
      if (
        opts.bypassCache // Bypass the cache.
        || (expireDuration && data?.lastUpdated && (Date.now() - expireDuration) > data?.lastUpdated) // Cached version expired.
        || !data // No data was returned.
      ) {
        console.log('getting current version');
        // Load a current version of the resource.
        return this.loadResource(opts.name);
      } else {
        console.log(data);
        console.log('Returning cached version');
        // Return the cached version.
        return data;
      }
    });
  };

  public loadResource = (resourceName: string): Promise<UserResource> => {
    return RESOURCES[resourceName].load(this.userId).then(((res: UserResource) => this.cacheResource(resourceName, res)));
  };

  public cacheResource = (resourceName: string, data: UserResource): Promise<UserResource> => {
    console.log(`caching resource ${resourceName}`);
    return this.store.saveResource(resourceName, data).then(() => data);
  };
}

