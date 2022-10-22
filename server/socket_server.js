const WebSocket = require('ws');

HEARTBEAT_INTERVAL = 30000 // 30 Seconds
PORT = 8080;

function heartbeat() {
  this.isAlive = true;
}

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws, req) => {
    console.log('Client connected.');
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.send('{ "type": "ping", "direction": "inbound"}');
    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });
});

// Ping each client and send a heartbeat.
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
        console.log('Lost heartbeat. Disconnecting client.')
        return ws.terminate();
    } 
    ws.isAlive = false;
    ws.ping();
    ws.send('{ "type": "ping", "direction": "inbound"}');
  });
}, HEARTBEAT_INTERVAL);

// Clear the heartbeat interval on close.
wss.on('close', function close() {
  clearInterval(interval);
});

console.log('Websocket Server started:');
console.log(`  Listening on port ${PORT}.`)
console.log(`  Heartbeat interval is ${HEARTBEAT_INTERVAL/1000} seconds.`)