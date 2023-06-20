// ###################################
// ## REMOTE MODEL
// ###################################

export interface RemoteCommandState {
  mode: 'remote' | 'viewer' | 'player';
  remoteConnected: boolean;
  viewerConnected: boolean;
  videoId: string;
  sentCommands: RemoteCommand[];
  receivedCommands: RemoteCommand[];
}

export interface RemoteCommand {
  id: string;
  client: 'remote' | 'viewer' | 'player';
  command: string;
  timestamp: number;
  videoId?: string;
  ack?: boolean;
}

export interface RemoteCommandAck {
  id: string;
  clientType: 'remote' | 'viewer' | 'player';
}

export const initialRemoteCommandState = {
  mode: 'player',
  remoteConnected: false,
  viewerConnected: false,
  videoId: '',
  sentCommands: <RemoteCommand[]>[],
  receivedCommands: <RemoteCommand[]>[],
};

export interface RemoteConnectAck {
  clientType: 'remote' | 'viewer' | 'player';
}

export interface RemoteHandshake {
  //userId: string;
  clientType: 'remote' | 'viewer' | 'player';
}

export interface RemoteInit {
  userId: string;
  clientType: 'remote' | 'viewer' | 'player';
}

export interface ClientType {
  clientType: 'remote' | 'viewer' | 'player';
}
