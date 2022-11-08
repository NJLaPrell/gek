import { Playlist, Subscription } from './shared/list.model';
import { Rule } from './shared/rules.model';
import { Video } from './shared/video.model';


export interface BasicResource {
  lastUpdated: number;
}

export interface RulesResource extends BasicResource {
  items: Rule[];
}

export interface EmptyResource extends BasicResource {
  lastUpdated: number;
  items: [];
}

export interface SubscriptionResource extends BasicResource {
  items: Subscription[];
}

export interface PlaylistResource extends BasicResource {
  items: Playlist[];
}

export interface ErrorQueueItem {
  videoId: string;
  playlistId: string;
  errors: any[];
  video: Video;
  failDate: number;
}

export interface ErrorQueueResource extends BasicResource {
  items: ErrorQueueItem[];
}

export interface UnsortedVideosResource extends BasicResource {
  items: Video[];
}

export interface HistoryResource extends BasicResource {
  sortedCount: number;
  unsortedCount: number;
  errorCount: number;
}

export type UserResource = RulesResource | SubscriptionResource | PlaylistResource | EmptyResource | ErrorQueueResource | UnsortedVideosResource | HistoryResource;





