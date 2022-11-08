module.exports = {
  apps : [{
    name   : 'Socket Server',
    script : 'npm',
    args: 'run start:dev:socket-server',
    watch: ['server/socket_server.js'],
    log_file: 'SocketServer.log'
  },
  {
    name   : 'Rest Server',
    script : 'npm',
    args: 'run start:dev:rest-server',
    watch: ['server'],
    log_file: 'RestServer.log'
  },
  {
    name   : 'App Server',
    script : 'npm',
    args: 'run start:dev:ui',
    log_file: 'AppServer.log'
  }]
}
