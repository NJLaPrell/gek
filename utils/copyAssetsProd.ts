const shell = require('shelljs');

shell.cp( '-R', 'server/lib', 'ytlist-docker/server/dist' );
shell.cp( '-R', 'server/models', 'ytlist-docker/server/dist' );
shell.cp( '-R', 'server/routes', 'ytlist-docker/server/dist' );
