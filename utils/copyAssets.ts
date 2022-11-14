const shell = require('shelljs');

shell.cp( '-R', 'server/lib', 'ytlist-docker/server/dist' );
shell.cp( '-R', 'server/models', 'ytlist-docker/server/dist' );
shell.cp( '-R', 'server/routes', 'ytlist-docker/server/dist' );
shell.cp( '-R', 'server/package.json', 'ytlist-docker/server' );
shell.cp( '-R', 'server/package-lock.json', 'ytlist-docker/server' );
shell.cp( '-R', 'dist/ytlist/*', 'ytlist-docker/ui/dist' );