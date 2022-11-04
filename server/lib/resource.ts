import * as path from 'path';
import { DataStore } from './data-store';
import { getSortedList } from './resourceLoaders/sorted-list';


// Map of resources and how to handle them.
const RESOURCES = {
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
    protected: false
  },
  history: {
    path: path.join(process.cwd(), 'server/state/history.json'),
    protected: false
  },
  rules: {
    path: path.join(process.cwd(), 'server/state/rules.json'),
    protected: false
  },
  videos: {
    path: path.join(process.cwd(), 'server/state/videos.json'),
    protected: false
  },
  sortedList: {
    defaultExpire: 3600000,
    load: getSortedList
  }
};

export class ResourceLoader {
  private userId: string;
  private store: DataStore;

  constructor(id: string) {
    this.userId = id;
    this.store = new DataStore(id);
  }

  public getResource = (resourceName: string): Promise<any> => {
    //const resource = RESOURCES[resourceName];
    return this.store.getResource(resourceName).then((data: any) => data || this.loadResource(resourceName));
  };

  public loadResource = (resourceName: string): Promise<any> => {
    return RESOURCES[resourceName].load(this.userId).then(((res: any) => this.cacheResource(resourceName, res)));
  };

  private cacheResource = (resourceName: string, data: any): Promise<any> => {
    return this.store.saveResource(resourceName, data).then(() => data);
  };
}

