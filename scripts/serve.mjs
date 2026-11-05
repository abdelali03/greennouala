import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.avif':'image/avif','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon','.md':'text/plain; charset=utf-8'};
export function createServer({base='/'}={}){
 return http.createServer(async(req,res)=>{
  try{
   const requestUrl=new URL(req.url,'http://localhost');
   let pathname=decodeURIComponent(requestUrl.pathname);
   if(!pathname.startsWith(base)){res.writeHead(404);res.end('Not found');return;}
   pathname=pathname.slice(base.length);
   if(pathname.split(/[\\/]/).some(segment=>segment.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}
   let filename=path.resolve(root,pathname||'.');
   if(filename!==root&&!filename.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
   const stat=await fs.stat(filename);
   if(stat.isDirectory()){
    if(!requestUrl.pathname.endsWith('/')){res.writeHead(308,{Location:requestUrl.pathname+'/'+requestUrl.search});res.end();return;}
    filename=path.join(filename,'index.html');
   }
   const content=await fs.readFile(filename);
   res.writeHead(200,{'Content-Type':mime[path.extname(filename).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
   res.end(content);
  }catch(error){res.writeHead(error.code==='ENOENT'?'404':500);res.end('Not found');}
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createServer();const port=Number(process.env.PORT||4173);
 server.listen(port,'127.0.0.1',()=>console.log(`Green Nouala: http://127.0.0.1:${port}`));
 process.on('SIGINT',()=>server.close(()=>process.exit(0)));
}
