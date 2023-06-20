const shell = require('shelljs');

shell.cp('-R', 'src/app/state/models/*', 'server/models/shared/');
