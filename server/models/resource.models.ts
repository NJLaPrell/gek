import { Playlist, Subscription } from './shared/list.model';
import { Rule } from './shared/rules.model';


export interface BasicResource {
  lastUpdated: number;
}

export interface SortedListResource extends BasicResource {
  items: Playlist[];
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

export type UserResource = SortedListResource | RulesResource | SubscriptionResource | PlaylistResource | EmptyResource;





