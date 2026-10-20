import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const cloud = new URL('dist/todo/', root);
const web = new URL('web/', root);
await mkdir(cloud, {recursive:true});
await mkdir(web, {recursive:true});
const sourceHtml = await readFile(new URL('index.html', root),'utf8');
const html = sourceHtml.replace('href="styles.css"','href="/todo/styles.css"').replace(/href="((?:favicon\.(?:svg|ico)|apple-touch-icon\.png)(?:\?[^"]*)?)"/g, 'href="/todo/$1"')
  .replace('src="app.js"','src="/todo/app.js"');
await writeFile(new URL('index.html', cloud),html);
const core = (await readFile(new URL('sync-core.mjs',root),'utf8')).replace('export function','function');
const client = (await readFile(new URL('sync-client.mjs',root),'utf8')).replace("import { mergeChanges } from './sync-core.mjs';",'').replace('export class','class');
const app = await readFile(new URL('app.js',root),'utf8');
await writeFile(new URL('app.js',cloud),'(() => {\n'+core+'\n'+client+'\nwindow.TodoCloud = { CloudSync };\n})();\n'+app);
await copyFile(new URL('styles.css',root),new URL('styles.css',cloud));
for (const name of ['index.html','app.js','styles.css']) await copyFile(new URL(name,root),new URL(name,web));
console.log('Built dist/todo/ (Cloudflare sync) and web/ (browser storage).');

for (const name of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
  await copyFile(new URL(name, root), new URL(name, cloud));
  await copyFile(new URL(name, root), new URL(name, web));
}
