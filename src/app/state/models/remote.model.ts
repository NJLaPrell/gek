// ###################################
// ## REMOTE MODEL
// ###################################

export interface RemoteCommandState {
    mode: 'remote' | 'viewer' | '';
    remoteConnected: boolean;
    viewerConnected: boolean;
    videoId: string;
    sentCommands: RemoteCommand[];
    receivedCommands: RemoteCommand[];
};

export interface RemoteCommand {
    id: string;
    command: string;
    timestamp: number;
    videoId: string;
    ack?: boolean;
};

export interface RemoteCommandAck {
    id: string;
}

export const initialRemoteCommandState = {
    mode: '',
    remoteConnected: false,
    viewerConnected: false,
    videoId: '',
    sentCommands: <RemoteCommand[]>[],
    receivedCommands: <RemoteCommand[]>[]
};

export interface RemoteConnectAck {
    clientType: 'remote' | 'viewer';
};

export interface RemoteHandshake {
    clientType: 'remote' | 'viewer';
};

export interface ClientType {
    clientType: 'remote' | 'viewer';
};