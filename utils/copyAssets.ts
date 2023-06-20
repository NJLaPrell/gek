const shell = require('shelljs');

shell.cp('-R', 'server/lib', 'gek-docker/server/dist');
shell.cp('-R', 'server/models', 'gek-docker/server/dist');
shell.cp('-R', 'server/routes', 'gek-docker/server/dist');
shell.cp('-R', 'server/package.json', 'gek-docker/server');
shell.cp('-R', 'server/package-lock.json', 'gek-docker/server');
shell.cp('.env.prod', 'gek-docker/server/.env');
shell.cp('.env.dev', '.env');
