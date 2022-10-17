import { Video } from "./video.model";

// ###################################
// ## HELPER CLASS
// ###################################
export class HistoryHelper {

    constructor(history: HistoryResponse) {
        
    }

    //get = (): Video[] => this.videos;

}

// ###################################
// ## HISTORY MODEL
// ###################################

export interface FailedVideo {
    videoId: string;
    playlistId: string;
    video: Video;
    errors: {
        message: string;
        domain: string;
        reason: string;
    }[]; 
    failDate: number;
}

export interface HistoryState {
    lastRun: number;
    errorQueue: FailedVideo[];
    unsorted: Video[];
}

export const initialHistoryState = <HistoryState>{
    lastRun: 0,
    errorQueue: [],
    unsorted: []
};

// ###################################
// ## API RESPONSE
// ###################################

export interface HistoryResponse {

}

