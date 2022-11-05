import { Playlist } from './shared/list.model';
import { Rule } from './shared/rules.model';

interface BasicResource {
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

export type UserResource = SortedListResource | RulesResource | EmptyResource;





