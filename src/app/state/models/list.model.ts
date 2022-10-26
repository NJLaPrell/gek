import { Playlist } from "./playlist.model";

// ###################################
// ## LIST MODEL
// ###################################
export interface ListState {
    items: Playlist[];
}

export const initialListState: ListState = {
    items: []
};

export interface GetListResponse {
    items: Playlist[]
}