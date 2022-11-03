const shell = require('shelljs');

shell.cp( "-R", "server/lib", "dist/server/lib" );
shell.cp( "-R", "server/state", "dist/server/state" );
shell.cp( "-R", "server/models", "dist/server/models" );
shell.cp( "server/credentials.json", "dist/server/credentials.json" );
shell.cp( "server/token.json", "dist/server/token.json" );