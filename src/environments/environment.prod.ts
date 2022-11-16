export const environment = {
  production: true,
  socket_url: 'ws://ytlist.laprell.org/socket',
  handshakeInterval: 5000,
  heartbeatInterval: 30000,
  reconnectInterval: 30000,
  reconnectMaxAttempts: 10,
  viewerStateInterval: 5000,


  debug: {
    remoteService: false,
    socketService: false,
    remoteComponent: false,
    viewerComponent: false
  }
};
