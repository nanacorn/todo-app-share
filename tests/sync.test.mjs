import test from 'node:test';
import assert from 'node:assert/strict';
import { CloudSync } from '../sync-client.mjs';
import { mergeChanges } from '../sync-core.mjs';

const seed = { state: { name: 'original', tasks: [{ id: 'first', text: 'first' }] }, images: {}, logo: null };
const storage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
};
function server(initial = seed) {
  let revision = 0, payload = structuredClone(initial), offline = false;
  return {
    set offline(value) { offline = value; },
    async fetcher(path, options = {}) {
      if (offline) throw new Error('offline');
      if (options.method === 'PUT') {
        const sent = JSON.parse(options.body);
        if (sent.revision !== revision) return Response.json({ revision, payload }, { status: 409 });
        revision++; payload = sent.payload;
      }
      return Response.json({ revision, payload, cleanupPending: false });
    }
  };
}
function device(remote, cache = storage()) {
  let value = structuredClone(seed);
  const sync = new CloudSync({ getPayload: () => value, applyPayload: (next) => { value = next; }, canApply: () => true, status: () => {}, fetcher: remote.fetcher, storage: cache, interval: 0 });
  return { sync, cache, get value() { return value; }, change: (action) => { action(value); sync.queue(value); } };
}
test('two devices preserve independent edits and deletions across stale revisions', async () => {
  const remote = server(), pc = device(remote), phone = device(remote);
  await pc.sync.start(); await phone.sync.start();
  pc.change((value) => { value.state.name = 'PC'; value.state.tasks.push({ id: 'pc', text: 'PC' }); });
  phone.change((value) => value.state.tasks.push({ id: 'phone', text: 'phone' }));
  await Promise.all([pc.sync.flush(), phone.sync.flush()]);
  await pc.sync.tick(); await phone.sync.tick();
  assert.deepEqual(pc.value, phone.value);
  assert.equal(pc.value.state.name, 'PC');
  assert.deepEqual(new Set(pc.value.state.tasks.map((item) => item.id)), new Set(['first', 'pc', 'phone']));
  pc.change((value) => value.state.tasks.splice(0, 1));
  phone.change((value) => { value.state.tasks[0].text = 'stale edit'; });
  await Promise.all([pc.sync.flush(), phone.sync.flush()]);
  await pc.sync.tick(); await phone.sync.tick();
  assert.deepEqual(pc.value, phone.value);
  assert.ok(!pc.value.state.tasks.some((item) => item.id === 'first'));
});
test('offline changes survive closing the device and merge after reconnect', async () => {
  const remote = server(), pc = device(remote), phone = device(remote);
  await pc.sync.start(); await phone.sync.start();
  remote.offline = true;
  phone.change((value) => value.state.tasks.push({ id: 'offline', text: 'offline' }));
  await phone.sync.flush().catch(() => {});
  remote.offline = false;
  pc.change((value) => { value.state.name = 'other device'; });
  await pc.sync.flush();
  const reopened = device(remote, phone.cache);
  await reopened.sync.start(); await pc.sync.tick();
  assert.deepEqual(reopened.value, pc.value);
  assert.equal(reopened.value.state.name, 'other device');
  assert.ok(reopened.value.state.tasks.some((item) => item.id === 'offline'));
});
test('local section reordering retains a new remote section', () => {
  const base = [{ id: 'a' }, { id: 'b' }];
  assert.deepEqual(mergeChanges(base, [base[1], base[0]], [...base, { id: 'c' }]).map((item) => item.id), ['b', 'a', 'c']);
});

test('deleting a section removes its complete tree without restoring stale edits or changing the template', async () => {
  const sections = [
    { id: 'remove', name: 'Remove', tasks: [
      { id: 'parent', text: 'parent', done: false, children: [{ id: 'child', text: 'child', done: false, children: [] }] },
      { id: 'archived-task', text: 'archived', done: true, children: [] }
    ] },
    { id: 'keep', name: 'Keep', tasks: [{ id: 'keep-task', text: 'original', done: false, children: [] }] }
  ];
  const initial = { state: { projects: [{ id: 'project', sections }], templates: { example: { sections: structuredClone(sections) } } }, images: {}, logo: null };
  const remote = server(initial), pc = device(remote), phone = device(remote);
  await pc.sync.start(); await phone.sync.start();
  pc.change((value) => { value.state.projects[0].sections.splice(0, 1); });
  phone.change((value) => {
    value.state.projects[0].sections[0].tasks[0].children[0].text = 'stale child edit';
    value.state.projects[0].sections[1].tasks[0].text = 'phone edit to keep';
  });
  await Promise.all([pc.sync.flush(), phone.sync.flush()]);
  await pc.sync.tick(); await phone.sync.tick();
  assert.deepEqual(pc.value, phone.value);
  assert.deepEqual(pc.value.state.projects[0].sections.map((section) => section.id), ['keep']);
  assert.equal(pc.value.state.projects[0].sections[0].tasks[0].text, 'phone edit to keep');
  assert.deepEqual(pc.value.state.templates, initial.state.templates);
});

test('dark mode on an existing workspace syncs alongside another device task edit', async () => {
  // Workspaces saved before the mode setting was introduced have no colorMode.
  const remote = server(), pc = device(remote), phone = device(remote);
  await pc.sync.start(); await phone.sync.start();
  pc.change((value) => { value.state.colorMode = 'dark'; });
  phone.change((value) => { value.state.tasks[0].text = 'edited on phone'; });
  await Promise.all([pc.sync.flush(), phone.sync.flush()]);
  await pc.sync.tick(); await phone.sync.tick();
  assert.deepEqual(pc.value, phone.value);
  assert.equal(pc.value.state.colorMode, 'dark');
  assert.equal(pc.value.state.tasks[0].text, 'edited on phone');
  assert.deepEqual(pc.value.images, seed.images);
  pc.change((value) => { value.state.colorMode = 'light'; });
  await pc.sync.flush();
  const reopened = device(remote, phone.cache);
  await reopened.sync.start();
  assert.equal(reopened.value.state.colorMode, 'light');
  assert.equal(reopened.value.state.tasks[0].text, 'edited on phone');
});
test('project order sync retains another device task edit and archived project', async () => {
  const initial = { state: { projects: [
    { id: 'a', archived: false, tasks: [{ id: 'task-a', text: 'original' }] },
    { id: 'archived', archived: true, tasks: [] },
    { id: 'b', archived: false, tasks: [] }
  ] }, images: {}, logo: null };
  const remote = server(initial), pc = device(remote), phone = device(remote);
  await pc.sync.start(); await phone.sync.start();
  pc.change((value) => { const [a, archived, b] = value.state.projects; value.state.projects = [b, archived, a]; });
  phone.change((value) => { value.state.projects[0].tasks[0].text = 'edited on phone'; });
  await Promise.all([pc.sync.flush(), phone.sync.flush()]);
  await pc.sync.tick(); await phone.sync.tick();
  assert.deepEqual(pc.value, phone.value);
  assert.deepEqual(pc.value.state.projects.map((project) => project.id), ['b', 'archived', 'a']);
  assert.equal(pc.value.state.projects[1].archived, true);
  assert.equal(pc.value.state.projects[2].tasks[0].text, 'edited on phone');
});

test('project modes sync independently of the global mode, appearance and concurrent tasks', async () => {
  const initial = { state: { colorMode: 'light', projects: [
    { id: 'a', sections: [], appearance: { theme: { accent: '#a5cdef' }, backgroundMode: 'image' } },
    { id: 'b', sections: [] }
  ] }, images: { a: { data: 'existing-image' } }, logo: null };
  const remote = server(initial), pc = device(remote), phone = device(remote);
  await pc.sync.start(); await phone.sync.start();
  pc.change((value) => { value.state.projects[0].colorMode = 'dark'; });
  phone.change((value) => { value.state.projects[0].sections.push({ id: 'section', tasks: [{ id: 'task', text: 'phone edit' }] }); value.state.projects[1].colorMode = 'light'; });
  await Promise.all([pc.sync.flush(), phone.sync.flush()]);
  await pc.sync.tick(); await phone.sync.tick();
  assert.deepEqual(pc.value, phone.value);
  assert.equal(pc.value.state.colorMode, 'light');
  assert.equal(pc.value.state.projects[0].colorMode, 'dark');
  assert.equal(pc.value.state.projects[1].colorMode, 'light');
  assert.equal(pc.value.state.projects[0].sections[0].tasks[0].text, 'phone edit');
  assert.deepEqual(pc.value.state.projects[0].appearance, initial.state.projects[0].appearance);
  assert.deepEqual(pc.value.images, initial.images);

  pc.change((value) => { delete value.state.projects[0].colorMode; });
  phone.change((value) => { value.state.colorMode = 'dark'; });
  await Promise.all([pc.sync.flush(), phone.sync.flush()]);
  const reopened = device(remote, pc.cache);
  await reopened.sync.start();
  assert.equal(reopened.value.state.colorMode, 'dark');
  assert.ok(!Object.hasOwn(reopened.value.state.projects[0], 'colorMode'));
  assert.equal(reopened.value.state.projects[1].colorMode, 'light');
  assert.deepEqual(reopened.value.images, initial.images);
});
