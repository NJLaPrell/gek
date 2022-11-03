import { Playlist } from './shared/list.model';

interface BasicResource {
  lastUpdated: number;
}

export interface SortedListResource extends BasicResource {
  items: Playlist[];
}

export type UserResource = SortedListResource;