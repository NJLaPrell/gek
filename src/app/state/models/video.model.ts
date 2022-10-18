// ###################################
// ## HELPER CLASS
// ###################################
export class VideoListHelper {
    videos: Video[];

    constructor(videoList: Video[]) {
        this.videos = videoList.map(v => ({
            ...v,
            ...{ processedDate: v.processedDate || Date.now() }
        }));
    }

    get = (): Video[] => this.videos;

}

// ###################################
// ## VIDEO MODEL
// ###################################

export interface Video {
    id: string;
    processedDate?: number;
    errorMessage?: any;
    channelId: string;
    playlistItemId?: string;
    channelName: string;
    title: string;
    published: string;
    updated: string;
    description: string;
    link?: string;
    thumbnail?: string;
    authorName?: string;
    channelLink?: string;
    viewCount?: number;
    thumbCount?: number;
}

export interface VideoState {
    channel: {
        [key: string]: Video[];
    }
    playlist: {
        [key: string]: Video[];
    }
    unsorted: {
        [key: string]: Video[];
    }
    errorBuffer: {
        [key: string]: Video[];
    }
}


export const initialVideoState: VideoState = {
    channel: {},
    playlist: {},
    unsorted: {},
    errorBuffer: {}
};

// ###################################
// ## API RESPONSE
// ###################################


