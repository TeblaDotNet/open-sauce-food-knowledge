import {spawnSync} from 'node:child_process';
for(const args of [['--test','tests/migration.test.mjs'],['tools/editorial-tests.mjs']]){const p=spawnSync(process.execPath,args,{stdio:'inherit',windowsHide:true});if(p.status!==0)process.exit(p.status??1);}
