import { createAction, props } from '@ngrx/store';
import { RemoteCommand, RemoteCommandAck, RemoteConnectAck, RemoteHandshake, ClientType } from '../models/remote.model';

export const initializeSocketConnection = createAction(
    '[Remote] Initialize Socket Connection',
    props<RemoteHandshake>()
);

export const connectionEstablished = createAction(
    '[Remote] Connection Established',
    props<RemoteHandshake>()
)

export const sendHandshake = createAction(
    '[Remote] Sent Handshake',
    props<RemoteHandshake>()
)

export const receivedHandshake = createAction(
    '[Remote] Received Handshake',
    props<RemoteHandshake>()
)

export const sendCommand = createAction(
    '[Remote] Send Command',
    props<{ command: RemoteCommand }>()
);

export const receivedCommand = createAction(
    '[Remote] Command Received',
    props<{ command: RemoteCommand }>()
);

export const sendCommandAck = createAction(
    '[Remote] Send Command Ack',
    props<RemoteCommandAck>()
);

export const receivedCommandAck = createAction(
    '[Remote] Command Ack Received',
    props<RemoteCommandAck>()
);

export const sendConnectAck = createAction(
    '[Remote] Send Connect Ack',
    props<RemoteConnectAck>()
);

export const receiveConnectAck = createAction(
    '[Remote] Received Connect Ack',
    props<RemoteConnectAck>()
);

export const remoteClientTimeout = createAction(
    '[Remote] Remote Client Timeout',
    props<ClientType>()
);

export const connectionLost = createAction(
    '[Remote] Connection Lost',
    props<ClientType>()
);

export const reconnected = createAction(
    '[Remote] Reconnected',
    props<ClientType>()
);

export const disconnect = createAction(
    '[Remote] Disconnect',
    props<ClientType>()
);

export const peerDisconnected = createAction(
    '[Remote] Peer Disconnected',
    props<ClientType>()
);
