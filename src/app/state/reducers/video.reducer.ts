import { createReducer, on } from '@ngrx/store';
import * as VideoActions from '../actions/video.actions';
import { VideoListHelper, initialVideoState } from '../models/video.model';

export const videoFeatureKey = 'videos';

export const videoReducer = createReducer(
    initialVideoState,
    on(VideoActions.getChannelVideos, (state, action) => {
        const channel = { ...state.channel };
        channel[action.channelId] = [];
        return {
            ...state, 
            channel
        }
    }),
    on(VideoActions.getChannelVideosFail, state => ({ ...state })),
    on(VideoActions.getChannelVideosSuccess, (state, action) => { 
        const channel = { ...state.channel };
        channel[action.channelId]= new VideoListHelper(action.response).get();
        return {
            ...state, 
            channel
        }
    }),
    on(VideoActions.getPlaylistVideos, (state, action) => {
        const playlist = { ...state.playlist };
        playlist[action.playlistId] = [];
        return {
            ...state, 
            playlist
        }
    }),
    on(VideoActions.getPlaylistVideosFail, state => ({ ...state })),
    on(VideoActions.getPlaylistVideosSuccess, (state, action) => { 
        const playlist = { ...state.playlist };
        playlist[action.playlistId]= new VideoListHelper(action.response).get();
        return {
            ...state, 
            playlist
        }
    })
);