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

export interface FailedVideo extends Video {
    failDate: number;
    error: string;
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

