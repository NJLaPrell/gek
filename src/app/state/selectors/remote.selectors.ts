import { createFeatureSelector, createSelector } from "@ngrx/store";
import { RemoteCommandState } from "../models/remote.model";
import * as fromRemote from '../reducers/remote.reducer';


export const selectRemoteState = createFeatureSelector<RemoteCommandState>(
    fromRemote.remoteFeatureKey
);

export const selectRemoteMode = createSelector(
    selectRemoteState,
    (state) => state.mode
);

export const selectPeerConnected = createSelector(
    selectRemoteState,
    (state) => state.mode === 'remote' ? state.viewerConnected : state.remoteConnected
);

export const selectConnected = createSelector(
    selectRemoteState,
    (state) => state.mode === 'viewer' ? state.viewerConnected : state.remoteConnected
);

export const selectReceivedCommands = createSelector(
    selectRemoteState,
    (state) => state.receivedCommands
);

export const selectRemoteVideoId = createSelector(
    selectRemoteState,
    (state) => state.videoId
);
