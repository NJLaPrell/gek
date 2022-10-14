import { createFeatureSelector, createSelector } from "@ngrx/store";
import { VideoState } from "../models/video.model";
import * as fromVideo from '../reducers/video.reducer';


export const selectVideoState = createFeatureSelector<VideoState>(
    fromVideo.videoFeatureKey
);

export const selectChannelVideos = createSelector(
    selectVideoState,
    (state) => state.channel
);

export const selectUnsortedVideos = createSelector(
    selectVideoState,
    (state) => state.unsorted
);

export const selectErrorVideos = createSelector(
    selectVideoState,
    (state) => state.errorBuffer
);

export const selectPlaylistVideos = createSelector(
    selectVideoState,
    (state) => state?.playlist ?? {}
);