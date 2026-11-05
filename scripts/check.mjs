import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {createServer} from './serve.mjs';
const files=[];const errors=[];let references=0;
async function walk(folder='.'){
 for(const entry of await fs.readdir(folder,{withFileTypes:true})){
  if(entry.name.startsWith('.')||entry.name==='scripts')continue;
  const file=path.posix.join(folder,entry.name);
  if(entry.isDirectory())await walk(file);else files.push(file);
 }
}
await walk();
const htmlFiles=files.filter(file=>file.endsWith('.html'));
const knownFiles=new Set(files);
const contentCache=new Map();
async function read(file){if(!contentCache.has(file))contentCache.set(file,await fs.readFile(file,'utf8'));return contentCache.get(file);}
async function reference(from,raw,{anchor=false}={}){
 raw=raw.replaceAll('&amp;','&');
 if(!raw||/^(data:|mailto:|tel:|https?:|javascript:|\/\/|%23)/i.test(raw))return;
 if(raw.startsWith('/')){errors.push(`${from}: absolute path ${raw} breaks project Pages deployment`);return;}
 const [pathname,fragment]=raw.split('#');
 let file=pathname?path.posix.normalize(path.posix.join(path.posix.dirname(from),decodeURIComponent(pathname.split('?')[0]))):from;
 if(file.startsWith('../')){errors.push(`${from}: path escapes site: ${raw}`);return;}
 if(file.endsWith('/'))file+='index.html';
 references++;
 try{
  const stat=await fs.stat(file);
  if(stat.isDirectory())file=path.posix.join(file,'index.html');
  await fs.access(file);
  if(!knownFiles.has(file))errors.push(`${from}: filename case mismatch for Linux: ${file}`);
  if(anchor&&fragment&&!['contact-details','instagram-unauth-icon','facebook-unauth-icon','email-icon'].includes(fragment)&&file.endsWith('.html')){
   const target=await read(file);
   const ids=[...target.matchAll(/\bid\s*=\s*["']([^"']+)/g)].map(m=>m[1]);
   if(!ids.includes(decodeURIComponent(fragment)))errors.push(`${from}: missing #${fragment} in ${file}`);
  }
 }catch{errors.push(`${from}: missing ${file} (${raw})`);}
}
for(const file of htmlFiles){
 const html=await read(file);
 const markup=html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<!--[\s\S]*?-->/g,'');
 if(!/<title>[^<]+<\/title>/i.test(html))errors.push(file+': missing page title');
 if(!/name="viewport"/.test(html))errors.push(file+': missing viewport');
 for(const match of markup.matchAll(/<(a|link|script|img|source|use)\b[^>]*>/gi)){
  const tag=match[0];
  if(match[1].toLowerCase()==='source'&&!/\b(?:srcset|src)\s*=/.test(tag))errors.push(`${file}: picture source has no image`);
  if(match[1].toLowerCase()==='img'&&!/\b(?:src|data-src)\s*=/.test(tag))errors.push(`${file}: image has no source`);
  for(const attr of tag.matchAll(/\b(href|src|data-src|data-image|xlink:href)\s*=\s*["']([^"']*)["']/gi)){
   await reference(file,attr[2],{anchor:match[1].toLowerCase()==='a'});
   if(/^(?:https?:)?\/\//.test(attr[2])&&['script','link','img','source','use'].includes(match[1].toLowerCase()))errors.push(`${file}: external runtime asset ${attr[2]}`);
   if(/^javascript:/i.test(attr[2]))errors.push(file+': inline JavaScript link');
  }
  const srcset=tag.match(/\bsrcset\s*=\s*["']([^"']*)/i)?.[1];
  if(srcset)for(const part of srcset.split(','))await reference(file,part.trim().split(/\s+/)[0]);
 }
 if(/\b(?:fbq|gtag|belkoraPush)\s*\(|<script[^>]*src=["'][^"']*(?:\/t\.js|googletagmanager|facebook)/.test(html))errors.push(file+': original tracking remains');
 if(/(?:href=["'][^"']*(?:wa\.me|tel:)[^"']*212667496559|contact@pepinierebelkora\.com)/i.test(html))errors.push(file+': original business contact remains');
}
for(const file of files.filter(file=>file.endsWith('.css'))){
 const css=await read(file);
 for(const match of css.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)){
  await reference(file,match[1]);
  if(/^https?:/.test(match[1]))errors.push(file+': external CSS asset '+match[1]);
 }
}
for(const file of ['app.js','config.js']){
 try{new vm.Script(await read(file),{filename:file});}catch(error){errors.push(`${file}: ${error.message}`);}
}
const context={window:{}};vm.runInNewContext(await read('config.js'),context);
if(context.window.GREEN_NOUALA?.name!=='Green Nouala')errors.push('config.js: incorrect branding');
const catalogue=JSON.parse(await fs.readFile('docs/catalogue.json','utf8'));
if(catalogue.length<7||!catalogue.some(p=>p.latin==='Bismarckia nobilis'))errors.push('Plant catalogue incomplete');
for(const file of ['contact-us/index.html','bismarckia/index.html','bismarckia/darija/index.html']){
 const html=await read(file);
 if(!/id="leadForm"/.test(html))errors.push(file+': missing quote form');
 for(const name of ['contact_name','phone','city'])if(!html.includes(`name="${name}"`))errors.push(file+': missing field '+name);
}
// Smoke-test actual HTTP serving under a GitHub project subdirectory.
const server=createServer({base:'/greennouala/'});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
try{
 for(const file of [...htmlFiles,'app.js','config.js','styles.css','assets/favicon.svg']){
  const r=await fetch(origin+'/greennouala/'+file);
  if(r.status!==200)errors.push(`${file}: HTTP ${r.status}`);
 }
 const denied=await fetch(origin+'/greennouala/.git/config');if(denied.status!==403)errors.push('Preview server exposes hidden files');
}finally{await new Promise(resolve=>server.close(resolve));}
if(errors.length){console.error(errors.join('\n'));console.error(`${errors.length} issue(s).`);process.exitCode=1;}
else console.log(`PASS: ${htmlFiles.length} HTML pages; ${references} local references; CSS assets; JavaScript syntax; quote forms; catalogue; HTTP under /greennouala/.`);
