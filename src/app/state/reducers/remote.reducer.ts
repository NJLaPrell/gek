import { createReducer, on } from '@ngrx/store';
import * as RemoteActions from '../actions/remote.actions';
import { initialRemoteCommandState, RemoteCommand } from '../models/remote.model';

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
        console.log('cmd', action);
        state.receivedCommands.unshift(action);
        return {
            ...state
        }
    }),
    on(RemoteActions.sendCommand, (state, action) => {
        const newCommand = { ...action };
        newCommand.ack = false;
        state.sentCommands.unshift(newCommand);
        return {
            ...state
        }
    }),
    on(RemoteActions.receivedCommandAck, (state, action) => {
        const ix = state.sentCommands.findIndex(c => c.id === action.id);
        state.sentCommands[ix].ack = true;
        return {
            ...state
        }
    }),
    on(RemoteActions.remoteClientTimeout, (state, action) => ({
        ...state,
        ...(action.clientType === 'remote' ? { remoteConnected: false } : {} ),
        ...(action.clientType === 'viewer' ? { viewerConnected: false } : {} )
    })),
    on(RemoteActions.connectionLost, (state, action) => ({
        ...state,
        ...(action.clientType === 'remote' ? { remoteConnected: false } : {} ),
        ...(action.clientType === 'viewer' ? { viewerConnected: false } : {} )
    })),
    on(RemoteActions.reconnected, (state, action) => ({
        ...state,
        ...(action.clientType === 'remote' ? { remoteConnected: true } : {} ),
        ...(action.clientType === 'viewer' ? { viewerConnected: true } : {} )
    })),
    on(RemoteActions.peerDisconnected, (state, action) => ({
        ...state,
        ...(action.clientType === 'remote' ? { remoteConnected: false } : {} ),
        ...(action.clientType === 'viewer' ? { viewerConnected: false } : {} )
    })),
    on(RemoteActions.disconnect, () => ({ ...initialRemoteCommandState }))
    
);