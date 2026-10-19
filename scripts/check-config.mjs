import { readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
const database = config.d1_databases?.find(item=>item.binding==='DB');
if (!database || !/^[a-f0-9-]{36}$/i.test(database.database_id) || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(database.database_id)) {
  console.error('Deploy stopped: create your own D1 database and set its database_id in wrangler.jsonc. See DEPLOY_CLOUDFLARE.md.');
  process.exit(1);
}
if (!config.r2_buckets?.some(item=>item.binding==='BUCKET' && item.bucket_name)) {
  console.error('Deploy stopped: configure your own R2 bucket binding.');
  process.exit(1);
}
