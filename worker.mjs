const IMAGE_PATH = '/todo/api/images/';
const ID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const color = (value) => typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value);
const theme = (value) => value && ['start', 'end', 'accent'].every((key) => color(value[key]));
const text = (value, limit) => typeof value === 'string' && value.length <= limit;
const keysOnly = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every((key) => keys.includes(key));
const imageId = (url) => typeof url === 'string' && url.startsWith(IMAGE_PATH) && ID.test(url.slice(IMAGE_PATH.length)) ? url.slice(IMAGE_PATH.length) : null;
const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
function validPayload(payload) {
  if (!keysOnly(payload, ['state', 'images', 'logo'])) return false;
  const state = payload.state;
  if (!keysOnly(state, ['projects', 'theme', 'backgroundMode', 'colorMode', 'brandName', 'templates']) || !theme(state.theme) || !['image', 'color'].includes(state.backgroundMode) || (state.colorMode !== undefined && !['light', 'dark'].includes(state.colorMode)) || !text(state.brandName, 80)) return false;
  let count = 0;
  const ids = new Set();
  const unique = (id) => { if (!ID.test(id) || ids.has(id)) return false; ids.add(id); return true; };
  function task(item, depth = 0) {
    return ++count <= 10000 && depth <= 30 && keysOnly(item, ['id', 'text', 'done', 'completedAt', 'children']) && unique(item.id) && text(item.text, 500) && typeof item.done === 'boolean' && (item.completedAt === null || Number.isFinite(item.completedAt)) && Array.isArray(item.children) && item.children.every((child) => task(child, depth + 1));
  }
  const sections = (list) => Array.isArray(list) && list.length <= 1000 && list.every((section) => keysOnly(section, ['id', 'name', 'tasks']) && unique(section.id) && text(section.name, 80) && Array.isArray(section.tasks) && section.tasks.every((item) => task(item)));
  const appearance = (value) => keysOnly(value, ['theme', 'backgroundMode']) && theme(value.theme) && ['image', 'color'].includes(value.backgroundMode);
  if (!Array.isArray(state.projects) || state.projects.length > 1000 || !state.projects.every((project) => keysOnly(project, ['id', 'name', 'archived', 'sections', 'appearance', 'colorMode']) && unique(project.id) && text(project.name, 80) && typeof project.archived === 'boolean' && (project.colorMode === undefined || ['light', 'dark'].includes(project.colorMode)) && (!project.appearance || appearance(project.appearance)) && sections(project.sections))) return false;
  if (!keysOnly(state.templates, ['templateA', 'templateB']) || !['templateA', 'templateB'].every((key) => keysOnly(state.templates[key], ['sections']) && sections(state.templates[key].sections))) return false;
  if (!payload.images || typeof payload.images !== 'object' || Array.isArray(payload.images)) return false;
  for (const [scope, image] of Object.entries(payload.images)) {
    if (scope !== 'global' && !state.projects.some((project) => project.id === scope && project.appearance)) return false;
    if (!keysOnly(image, ['data', 'name', 'previousTheme']) || !imageId(image.data) || !text(image.name, 255) || !theme(image.previousTheme)) return false;
  }
  return payload.logo === null || Boolean(imageId(payload.logo));
}
function referencedImages(payload) {
  return new Set([...(Object.values(payload?.images || {}).map((image) => imageId(image.data))), imageId(payload?.logo)].filter(Boolean));
}
async function readWorkspace(env) {
  const row = await env.DB.prepare('SELECT revision, payload FROM workspace WHERE id = 1').first();
  return { revision: row.revision, payload: row.payload ? JSON.parse(row.payload) : null };
}
async function collectImages(env) {
  const referenced = referencedImages((await readWorkspace(env)).payload);
  const rows = (await env.DB.prepare("SELECT id, object_key FROM media WHERE status = 'deleting' OR created_at < ?").bind(Date.now() - 86400000).all()).results;
  let pending = false;
  for (const row of rows) {
    if (referenced.has(row.id)) continue;
    try {
      await env.BUCKET.delete(row.object_key);
      await env.DB.prepare('DELETE FROM media WHERE id = ?').bind(row.id).run();
    } catch { pending = true; }
  }
  return pending;
}
async function updateWorkspace(request, env) {
  const raw = await request.text();
  if (raw.length > 1500000) return json({ error: '저장할 데이터가 너무 큽니다.' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: '잘못된 데이터입니다.' }, 400); }
  if (!Number.isSafeInteger(body.revision) || body.revision < 0 || !validPayload(body.payload)) return json({ error: '잘못된 데이터입니다.' }, 400);
  const current = await readWorkspace(env);
  if (current.revision !== body.revision) return json(current, 409);
  const nextIds = referencedImages(body.payload);
  for (const id of nextIds) {
    if (!await env.DB.prepare("SELECT id FROM media WHERE id = ? AND status = 'active'").bind(id).first()) return json({ error: '삭제됐거나 존재하지 않는 이미지입니다.' }, 400);
  }
  const removed = [...referencedImages(current.payload)].filter((id) => !nextIds.has(id));
  const payload = JSON.stringify(body.payload);
  const statements = [env.DB.prepare('UPDATE workspace SET payload = ?, revision = revision + 1 WHERE id = 1 AND revision = ?').bind(payload, body.revision)];
  for (const id of removed) statements.push(env.DB.prepare("UPDATE media SET status = 'deleting' WHERE id = ? AND EXISTS (SELECT 1 FROM workspace WHERE id = 1 AND revision = ? AND payload = ?)").bind(id, body.revision + 1, payload));
  const result = await env.DB.batch(statements);
  if (result[0].meta.changes !== 1) return json(await readWorkspace(env), 409);
  return json({ revision: body.revision + 1, payload: body.payload, cleanupPending: await collectImages(env) });
}
async function uploadImage(request, env) {
  const type = request.headers.get('Content-Type')?.split(';')[0];
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(type)) return json({ error: '지원하지 않는 이미지입니다.' }, 415);
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > 1500000) return json({ error: '이미지가 너무 큽니다.' }, 413);
  const signature = new Uint8Array(bytes);
  const valid = type === 'image/png' ? [137,80,78,71,13,10,26,10].every((value,index) => signature[index] === value) : type === 'image/jpeg' ? signature[0] === 255 && signature[1] === 216 && signature[2] === 255 : String.fromCharCode(...signature.slice(0,4)) === 'RIFF' && String.fromCharCode(...signature.slice(8,12)) === 'WEBP';
  if (!valid) return json({ error: '이미지 파일을 읽을 수 없습니다.' }, 400);
  const id = crypto.randomUUID();
  const key = 'images/' + id;
  await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: type } });
  try { await env.DB.prepare('INSERT INTO media (id, object_key, content_type, created_at) VALUES (?, ?, ?, ?)').bind(id, key, type, Date.now()).run(); }
  catch (error) { await env.BUCKET.delete(key); throw error; }
  return json({ data: IMAGE_PATH + id }, 201);
}
async function imageResponse(request, env, id) {
  if (!ID.test(id)) return new Response('Not found', { status: 404 });
  const record = await env.DB.prepare("SELECT object_key FROM media WHERE id = ? AND status = 'active'").bind(id).first();
  if (!record) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  const object = await env.BUCKET.get(record.object_key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  object.writeHttpMetadata(headers);
  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}
async function pruneTasks(env) {
  const current = await readWorkspace(env);
  if (!current.payload) return;
  let changed = false;
  const prune = (tasks) => tasks.filter((task) => {
    if (task.done && Number.isFinite(task.completedAt) && Date.now() - task.completedAt >= 30 * 86400000) { changed = true; return false; }
    task.children = prune(task.children);
    return true;
  });
  current.payload.state.projects.forEach((project) => project.sections.forEach((section) => { section.tasks = prune(section.tasks); }));
  if (changed) await env.DB.prepare('UPDATE workspace SET payload = ?, revision = revision + 1 WHERE id = 1 AND revision = ?').bind(JSON.stringify(current.payload), current.revision).run();
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/todo/api/')) {
      try {
        if (!['GET', 'HEAD'].includes(request.method) && request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) return json({ error: '다른 사이트에서 요청할 수 없습니다.' }, 403);
        if (url.pathname === '/todo/api/state' && request.method === 'GET') return json({ ...await readWorkspace(env), cleanupPending: await collectImages(env) });
        if (url.pathname === '/todo/api/state' && request.method === 'PUT') return await updateWorkspace(request, env);
        if (url.pathname === '/todo/api/images' && request.method === 'POST') return await uploadImage(request, env);
        if (url.pathname.startsWith(IMAGE_PATH) && ['GET', 'HEAD'].includes(request.method)) return await imageResponse(request, env, url.pathname.slice(IMAGE_PATH.length));
        return json({ error: 'Not found' }, 404);
      } catch (error) { console.error('Todo API:', error.message); return json({ error: '서버에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, 503); }
    }
    if (url.pathname === '/') return Response.redirect(new URL('/todo/', url), 302);
    if (url.pathname === '/todo') return Response.redirect(new URL('/todo/' + url.search, url), 308);
    if (!url.pathname.startsWith('/todo/')) return new Response('Not found', { status: 404 });
    return env.ASSETS.fetch(request);
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(Promise.all([pruneTasks(env), collectImages(env)])); }
};
