/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
dotenv.config({ path: '.env.dev' });

const fs = require('fs');

const devEnv = require('../src/environments/environment.dev.ts');
const prodEnv = require('../src/environments/environment.prod.ts');
const angularJson = require('../angular.json');

const required = ['SOC_HEARTBEAT_INTERVAL', 'HANDSHAKE_INTERVAL'];
const missing = required.find(r => typeof process.env[r] == 'undefined');

if (missing) {
  throw `Missing required variable: ${missing}`;
}

// environment.dev.ts
console.log('Generating src/environments/environment.dev.ts');
devEnv.environment.socket_url = String(process.env['SOCKET_URL']);
devEnv.environment.heartbeatInterval = parseInt(String(process.env['SOC_HEARTBEAT_INTERVAL']), 10);
devEnv.environment.handshakeInterval = parseInt(String(process.env['HANDSHAKE_INTERVAL']), 10);
devEnv.environment.reconnectInterval = parseInt(String(process.env['RECONNECT_INTERVAL']), 10);
devEnv.environment.viewerStateInterval = parseInt(String(process.env['VIEWER_STATE_INTERVAL']), 10);
devEnv.environment.reconnectMaxAttempts = parseInt(String(process.env['RECONNECT_MAX_ATTEMPTS']), 10);

devEnv.environment.debug = devEnv.environment.debug || {};
devEnv.environment.debug.remoteService = String(process.env['DEBUG_REMOTE_SERVICE']) === 'true';
devEnv.environment.debug.socketService = String(process.env['DEBUG_SOCKET_SERVICE']) === 'true';
devEnv.environment.debug.remoteComponent = String(process.env['DEBUG_REMOTE_COMPONENT']) === 'true';
devEnv.environment.debug.viewerComponent = String(process.env['DEBUG_VIEWER_COMPONENT']) === 'true';

fs.writeFileSync('src/environments/environment.dev.ts', `export const environment = ${JSON.stringify(devEnv.environment, null, 2)};`);

// environment.prod.ts
console.log('Generating src/environments/environment.prod.ts');
dotenv.config({ path: '.env.prod', override: true });

prodEnv.environment.socket_url = String(process.env['SOCKET_URL']);
prodEnv.environment.heartbeatInterval = parseInt(String(process.env['SOC_HEARTBEAT_INTERVAL']), 10);
prodEnv.environment.handshakeInterval = parseInt(String(process.env['HANDSHAKE_INTERVAL']), 10);
prodEnv.environment.reconnectInterval = parseInt(String(process.env['RECONNECT_INTERVAL']), 10);
prodEnv.environment.viewerStateInterval = parseInt(String(process.env['VIEWER_STATE_INTERVAL']), 10);
prodEnv.environment.reconnectMaxAttempts = parseInt(String(process.env['RECONNECT_MAX_ATTEMPTS']), 10);

prodEnv.environment.debug = prodEnv.environment.debug || {};
prodEnv.environment.debug.remoteService = String(process.env['DEBUG_REMOTE_SERVICE']) === 'true';
prodEnv.environment.debug.socketService = String(process.env['DEBUG_SOCKET_SERVICE']) === 'true';
prodEnv.environment.debug.remoteComponent = String(process.env['DEBUG_REMOTE_COMPONENT']) === 'true';
prodEnv.environment.debug.viewerComponent = String(process.env['DEBUG_VIEWER_COMPONENT']) === 'true';

fs.writeFileSync('src/environments/environment.prod.ts', `export const environment = ${JSON.stringify(prodEnv.environment, null, 2)};`);

// angular.json
angularJson.projects.gek.architect.serve.options.sslKey = process.env['SSL_KEY_PATH'];
angularJson.projects.gek.architect.serve.options.sslCert = process.env['SSL_CERT_PATH'];
angularJson.projects.gek.architect.serve.options.host = process.env['HOST_NAME'];

fs.writeFileSync('angular.json', JSON.stringify(angularJson, null, 2));
