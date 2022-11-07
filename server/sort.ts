import * as dotenv from 'dotenv';
// eslint-disable-next-line angular/module-getter
dotenv.config();

import { SortLists } from './lib/sort';

const idIx = process.argv.indexOf('-id') + 1;
if(idIx === 0)
  throw '-id argument required.';

const userId = process.argv[idIx];

new SortLists(userId).loadAndSort().then(success => console.log(`Success: ${success}`));
