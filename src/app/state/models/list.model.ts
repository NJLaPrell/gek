import { Video } from './video.model';

// ###################################
// ## LIST MODEL
// ###################################
export interface ListState {
  items: Playlist[];
  playlistLookup: { [key: string]: string };
  subscriptions: Subscription[];
}

export const initialListState: ListState = {
  items: [],
  playlistLookup: {},
  subscriptions: [],
};

export interface GetListResponse {
  items: Playlist[];
}

// ###################################
// ## PLAYLIST MODEL
// ###################################

export interface Playlists {
  lastUpdated: number | false;
  items: Playlist[];
}

export interface Playlist {
  playlistId?: string; //------
  title: string;
  description: string;
  thumbnail: string;
  lastUpdated?: number;
  newItemCount?: number; // TODO
  itemCount?: number; //------
  videos?: Video[]; //------
  channelId?: string; //XXXXXX
  publishedDate?: Date; //XXXXXX
  id?: string; //XXXXXX
}

export interface PlaylistTitle {
  id: string;
  title: string;
}

// ###################################
// ## SUBSCRIPTION MODEL
// ###################################

export interface Subscription {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  newItemCount: number;
}

export interface GetSubscriptionsResponse {
  lastUpdated: number;
  items: Subscription[];
}
