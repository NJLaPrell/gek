const shell = require('shelljs');

shell.cp( '-R', 'server/lib', 'dist/server/lib' );
shell.cp( '-R', 'server/models', 'dist/server/models' );
shell.cp( '-R', 'server/routes', 'dist/server/routes' );
