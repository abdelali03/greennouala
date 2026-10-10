import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):entry.name.endsWith('.js')?[path.join(dir,entry.name)]:[]);}
const targets=['server.mjs',...files('dist')];
for(const file of targets){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit',windowsHide:true});if(result.status!==0)process.exit(result.status||1);}
console.log(`${targets.length} JavaScript modules checked.`);
