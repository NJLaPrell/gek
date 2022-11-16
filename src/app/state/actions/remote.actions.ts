import { createAction, props } from '@ngrx/store';
import { RemoteCommand, RemoteCommandAck, RemoteConnectAck, RemoteHandshake, ClientType, RemoteInit } from '../models/remote.model';

export const initializeSocketConnection = createAction(
  '[Remote] Initialize Socket Connection',
  props<RemoteInit>()
);

export const connectionEstablished = createAction(
  '[Remote] Connection Established',
  props<RemoteHandshake>()
);

export const receivedHandshake = createAction(
  '[Remote] Received Handshake',
  props<RemoteHandshake>()
);

export const sendCommand = createAction(
  '[Remote] Send Command',
  props<RemoteCommand>()
);

export const receivedCommand = createAction(
  '[Remote] Command Received',
  props<RemoteCommand>()
);

export const serverTimeout = createAction(
  '[Remote] Server Timeout'
);

export const reconnected = createAction(
  '[Remote] Reconnected',
  props<ClientType>()
);

export const disconnect = createAction(
  '[Remote] Disconnect'
);

export const clientDisconnected = createAction(
  '[Remote] Client Disconnected'
);

export const peerDisconnected = createAction(
  '[Remote] Peer Disconnected'
);
