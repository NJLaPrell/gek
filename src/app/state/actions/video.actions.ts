import { createAction, props } from '@ngrx/store';
import { Video } from '../models/video.model';

export const getChannelVideos = createAction(
  '[Video] Get Channel Videos',
  props<{ channelId: string }>()
);

export const getChannelVideosSuccess = createAction(
    '[Video] Get Channel Videos Success',
    props<{ response: Video[], channelId: string }>()
);

export const getChannelVideosFail = createAction(
    '[Video] Get Channel Videos Fail',
    props<{ error: string }>()
);

export const getPlaylistVideos = createAction(
  '[Video] Get Playlist Videos',
  props<{ playlistId: string, useGApi?: boolean }>()
);

export const getPlaylistVideosSuccess = createAction(
    '[Video] Get Playlist Videos Success',
    props<{ response: Video[], playlistId: string }>()
);

export const getPlaylistVideosFail = createAction(
    '[Video] Get Playlist Videos Fail',
    props<{ error: string }>()
);

export const addToPlaylist = createAction(
  '[Video] Add to Playlist',
  props<{ videoId: string, playlistId: string }>()
);

export const addToPlaylistSuccess = createAction(
  '[Video] Add to Playlist Success',
  props<{ videoId: string, playlistId: string, message: string }>()
);

export const addToPlaylistFail = createAction(
  '[Video] Add to Playlist Fail',
  props<{ error: string }>()
);

export const rateVideo = createAction(
  '[Video] Rate Video',
  props<{ videoId: string, rating: string }>()
);

export const rateVideoSuccess = createAction(
  '[Video] Rate Video Success',
  props<{ message: string }>()
);

export const rateVideoFail = createAction(
  '[Video] Rate Video Fail',
  props<{ error: string }>()
);
