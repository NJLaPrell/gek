import * as shell from 'shelljs';

shell.cp( '-R', 'server/lib', 'dist/server/lib' );
shell.cp( '-R', 'server/models', 'dist/server/models' );
