// ###################################
// ## HELPER CLASS
// ###################################
export class PlaylistsHelper {
    lastUpdated: number | false;
    playlists: Playlist[];

    constructor(playlistResponse: PlaylistResponse) {
        this.lastUpdated = playlistResponse.lastUpdated;
        this.playlists = playlistResponse.items.map(pl => ({
            id: pl.id,
            channelId: pl.snippet.channelId,
            publishedDate: new Date(pl.snippet.publishedAt),
            title: pl.snippet.title,
            description: pl.snippet.description,
            thumbnail: pl.snippet.thumbnails.standard?.url || pl.snippet.thumbnails.default?.url || 'https://i.ytimg.com/img/no_thumbnail.jpg' 
        }));
    }

    get = (): Playlists => {
        let playlists = {
            lastUpdated: this.lastUpdated,
            items: this.playlists.sort((a, b) => a.title.localeCompare(b.title)),
            titleLookup: <any>{}
        }
        playlists.items.forEach((p: Playlist) => playlists.titleLookup[p.id] = p.title);
        return <Playlists>playlists;
    };

}

// ###################################
// ## PLAYLIST MODEL
// ###################################

export interface Playlists {
    lastUpdated: number | false;
    items: Playlist[]
    titleLookup: { [key: string]: string }
}

export interface Playlist {
    id: string;
    channelId: string;
    publishedDate: Date;
    title: string;
    description: string;
    thumbnail: string;
}

// ###################################
// ## API RESPONSE
// ###################################
export interface PlaylistResponse {
    lastUpdated: number;
    items: PlaylistResponseItem[]
}

export interface PlaylistResponseItem {
    kind: string;
    etag: string;
    id: string;
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: PlaylistResponseItemThumbnail;
            medium: PlaylistResponseItemThumbnail;
            high: PlaylistResponseItemThumbnail;
            standard: PlaylistResponseItemThumbnail;
        }
        channelTitle: string;
        localized: {
            title: string;
            description: string;
        }
    }
}

export interface PlaylistResponseItemThumbnail {
    url: string;
    width: number;
    height: number;
}

