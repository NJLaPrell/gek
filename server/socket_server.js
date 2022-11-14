const WebSocket = require('ws');

const HEARTBEAT_INTERVAL = 30000 // 30 Seconds
const PORT = 8080;

function heartbeat() {
    console.log('-heartbeat-');
    this.isAlive = true;
}

const wss = new WebSocket.Server({ port: PORT });


// Ping each client and send a heartbeat.
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
        console.log('Lost heartbeat. Disconnecting client.')
        return ws.terminate();
    }
    console.log('-ping-')
    ws.send('{ "type": "ping", "direction": "inbound"}');
    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);

wss.on('connection', (ws, req) => {
    console.log('Client connected.');
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.send('{ "type": "ping", "direction": "inbound"}');
    ws.on('message', function message(data) {
        let msg = {};
        try {
            msg = JSON.parse(data);
            console.log('Received: %s', data);
        } catch(e) {
            console.log(`Received malformed message: ${data}`)
            console.log(e);
        }
        
        if (msg.type && msg.type !== 'ping' && msg.direction === 'outbound'){
            msg.direction = 'inbound';
            wss.clients.forEach(function each(w) {
                console.log(`Sending: ${JSON.stringify(msg)}`);
                w.send(JSON.stringify(msg));
            })
        }
    });
});


// Clear the heartbeat interval on close.
wss.on('close', function close() {
    console.log('Connection closed.');
    clearInterval(interval);
});

console.log('Websocket Server started:');
console.log(`  Listening on port ${PORT}.`)
console.log(`  Heartbeat interval is ${HEARTBEAT_INTERVAL/1000} seconds.`)