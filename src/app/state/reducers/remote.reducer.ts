import { createReducer, on } from '@ngrx/store';
import * as RemoteActions from '../actions/remote.actions';
import { initialRemoteCommandState } from '../models/remote.model';

export const remoteFeatureKey = 'remote';

export const remoteReducer = createReducer(
  initialRemoteCommandState,
  on(RemoteActions.initializeSocketConnection, (state, action) => ({ ...state, mode: action.clientType })),
  on(RemoteActions.connectionEstablished, (state, action) => ({
    ...state,
    ...(action.clientType === 'remote' ? { remoteConnected: true } : {} ),
    ...(action.clientType === 'viewer' ? { viewerConnected: true } : {} )
  })),
  on(RemoteActions.receivedHandshake, (state, action) => ({
    ...state,
    ...(action.clientType === 'remote' ? { remoteConnected: true } : {} ),
    ...(action.clientType === 'viewer' ? { viewerConnected: true } : {} )
  })),
  on(RemoteActions.receivedCommand, (state, action) => {
    state.receivedCommands.unshift(action);
    return {
      ...state
    };
  }),
  on(RemoteActions.sendCommand, (state, action) => {
    const newCommand = { ...action };
    newCommand.ack = false;
    state.sentCommands.unshift(newCommand);
    return {
      ...state
    };
  }),
  on(RemoteActions.serverTimeout, (state) => ({ ...initialRemoteCommandState })),
  on(RemoteActions.reconnected, (state, action) => ({
    ...state,
    ...(action.clientType === 'remote' ? { remoteConnected: true } : {} ),
    ...(action.clientType === 'viewer' ? { viewerConnected: true } : {} )
  })),
  on(RemoteActions.peerDisconnected, (state) => ({
    ...state,
    ...(state.mode === 'remote' ? { viewerConnected: false } : {} ),
    ...(state.mode === 'viewer' ? { remoteConnected: false } : {} )
  })),
  on(RemoteActions.disconnect, () => ({ ...initialRemoteCommandState })),
  on(RemoteActions.clientDisconnected, () => ({ ...initialRemoteCommandState }))
    
);