import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const types = {html:'text/html; charset=utf-8', js:'text/javascript; charset=utf-8', css:'text/css; charset=utf-8', json:'application/json', png:'image/png', jpg:'image/jpeg', webp:'image/webp', mp4:'video/mp4', vtt:'text/vtt; charset=utf-8'};
// Les requêtes Range permettent au navigateur de rechercher une image vidéo
// sans télécharger à nouveau l’ensemble du fichier.
http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}); res.end(); return; }
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    const info = await stat(file);
    if (!info.isFile()) throw Error('not a file');
    const headers = {'Content-Type':types[path.extname(file).slice(1)] || 'application/octet-stream', 'Accept-Ranges':'bytes', 'Cache-Control':'no-cache'};
    let start=0, end=info.size-1, code=200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) { res.writeHead(416, {'Content-Range':`bytes */${info.size}`}); res.end(); return; }
      if (!match[1]) start = Math.max(0, info.size-Number(match[2]));
      else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
      if (start > end || start >= info.size) { res.writeHead(416, {'Content-Range':`bytes */${info.size}`}); res.end(); return; }
      code=206;
      headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length']=Math.max(0,end-start+1);
    res.writeHead(code, headers);
    if(req.method==='HEAD') {res.end(); return;}
    const stream=createReadStream(file,{start,end});
    stream.on('error',()=>res.destroy());
    req.on('close',()=>stream.destroy());
    stream.pipe(res);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('http://localhost:4173'));
