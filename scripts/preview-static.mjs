import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([['/',['index.html','text/html; charset=utf-8']],['/app.js',['app.js','text/javascript; charset=utf-8']],['/styles.css',['styles.css','text/css; charset=utf-8']]]);
const port = Number(process.env.PORT || 4173);
http.createServer(async(req,res)=>{
  const file = files.get(new URL(req.url,'http://localhost').pathname);
  if (!file) { res.writeHead(404).end(); return; }
  try { res.writeHead(200,{'Content-Type':file[1],'Cache-Control':'no-store'}).end(await readFile(new URL('../web/'+file[0],import.meta.url))); }
  catch { res.writeHead(500).end('Run npm run build first.'); }
}).listen(port,'127.0.0.1',()=>console.log(`Static preview: http://localhost:${port}/ (browser storage only)`));
