import * as dotenv from 'dotenv';
// eslint-disable-next-line angular/module-getter
dotenv.config();

import { SocketServer } from './lib/socket-server';

const soc = new SocketServer();

soc.serve();
