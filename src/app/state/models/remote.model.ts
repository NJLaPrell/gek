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
    client: 'remote' | 'viewer',
    command: string;
    timestamp: number;
    videoId?: string;
    ack?: boolean;
};

export interface RemoteCommandAck {
    id: string;
    clientType: 'remote' | 'viewer';
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