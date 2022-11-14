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
    videoId?: string;          //-----
    publishedAt?: string;      //-----
    title: string;             //-----
    description: string;       //-----
    channelId: string;         //-----
    channelTitle?: string;     //-----
    duration?: string          //-----
    viewCount?: number;        //-----
    likeCount?: number;        //-----
    commentCount?: number;     //-----
    playlistId?: string;       //-----
    playlistItemId?: string;   //-----
    playlistPosition?: number; //-----

    id?: string;               //XXXXX
    processedDate?: number;    //XXXXX
    errorMessage?: any;        //XXXXX
    channelName?: string;      //XXXXX
    published?: string;        //XXXXX
    updated?: string;          //XXXXX
    link?: string;             //XXXXX
    thumbnail?: string;
    authorName?: string;       //XXXXX
    thumbCount?: number;       //XXXXX
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


