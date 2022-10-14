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
  props<{ playlistId: string }>()
);

export const getPlaylistVideosSuccess = createAction(
    '[Video] Get Playlist Videos Success',
    props<{ response: Video[], playlistId: string }>()
);

export const getPlaylistVideosFail = createAction(
    '[Video] Get Playlist Videos Fail',
    props<{ error: string }>()
);
