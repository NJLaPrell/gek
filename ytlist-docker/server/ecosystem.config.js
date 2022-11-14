module.exports = {
  apps : [{
    name   : 'Socket Server',
    script : 'npm',
    args: 'run start:prod:socket-server',
    watch: ['server/socket_server.js'],
    log_file: 'SocketServer.log'
  },
  {
    name   : 'Rest Server',
    script : 'npm',
    args: 'run start:prod:rest-server',
    watch: ['server/rest_server.ts', 'server/lib', 'server/models', 'server/routes'],
    log_file: 'RestServer.log'
  },
  {
    name   : 'Sort Service',
    script : 'npm',
    args: 'run start:prod:sort-service',
    watch: ['server/sort.ts', 'server/lib', 'server/models'],
    log_file: 'SortService.log'
  }]
}
