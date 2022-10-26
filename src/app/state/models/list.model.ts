import { Video } from "./video.model";

// ###################################
// ## LIST MODEL
// ###################################
export interface ListState {
    items: Playlist[];
    playlistLookup: { [key: string]: string };
}

export const initialListState: ListState = {
    items: [],
    playlistLookup: {}
};

export interface GetListResponse {
    items: Playlist[];
}

export interface Playlists {
    lastUpdated: number | false;
    items: Playlist[];
}

export interface Playlist {
    playlistId?: string;      //------
    title: string;
    description: string;
    thumbnail: string;
    newItemCount?: number;    // TODO
    itemCount?: number;       //------
    videos?: Video[];         //------
    channelId?: string;       //XXXXXX
    publishedDate?: Date;     //XXXXXX
    id?: string;              //XXXXXX
}