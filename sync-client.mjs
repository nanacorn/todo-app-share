import { mergeChanges } from './sync-core.mjs';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const BASE_KEY = 'todo-share.cloud-base.v1';
const PENDING_KEY = 'todo-share.cloud-pending.v1';
export class CloudSync {
  constructor({ getPayload, applyPayload, canApply, status, storage = localStorage, fetcher = (...args) => fetch(...args), interval = 5000 }) {
    Object.assign(this, { getPayload, applyPayload, canApply, status, storage, fetcher, interval });
    this.base = null;
    this.viewBase = null;
    this.pending = null;
    this.running = null;
    this.connected = false;
    this.cleanupPending = false;
  }
  remember() {
    try {
      if (this.base) this.storage.setItem(BASE_KEY, JSON.stringify(this.base));
      if (this.pending) this.storage.setItem(PENDING_KEY, JSON.stringify(this.pending)); else this.storage.removeItem(PENDING_KEY);
    } catch { /* Cloud saves remain available when the browser cache is full. */ }
  }
  async request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await this.fetcher('/todo/api/' + path, { cache: 'no-store', ...options, signal: controller.signal });
      const body = await response.json();
      if (!response.ok && response.status !== 409) throw new Error(body.error || '서버에 연결하지 못했습니다.');
      return { response, body };
    } finally { clearTimeout(timeout); }
  }
  async upload(data) {
    if (data.startsWith('/todo/api/images/')) return data;
    const match = /^data:(image\/(?:webp|jpeg|png));base64,([a-z0-9+/=]+)$/i.exec(data);
    if (!match) throw new Error('이미지를 읽을 수 없습니다.');
    const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
    const { body } = await this.request('images', { method: 'POST', headers: { 'Content-Type': match[1] }, body: bytes });
    return body.data;
  }
  async prepare(payload) {
    const next = structuredClone(payload);
    for (const image of Object.values(next.images)) image.data = await this.upload(image.data);
    if (next.logo) next.logo = await this.upload(next.logo);
    return next;
  }
  apply(payload) {
    this.applyPayload(structuredClone(payload));
    this.viewBase = structuredClone(payload);
  }
  async start() {
    try {
      const cached = this.storage.getItem(BASE_KEY);
      if (cached) this.base = JSON.parse(cached);
      const queued = this.storage.getItem(PENDING_KEY);
      if (queued) this.pending = JSON.parse(queued);
    } catch { this.base = null; this.pending = null; }
    this.viewBase = structuredClone(this.base?.payload || this.getPayload());
    this.status('클라우드 데이터를 불러오는 중…');
    try {
      const { body } = await this.request('state');
      const pending = this.pending;
      const previous = this.base;
      this.base = { revision: body.revision, payload: body.payload };
      this.connected = true;
      this.cleanupPending = body.cleanupPending;
      if (!body.payload) {
        const converted = await this.prepare(pending || this.getPayload());
        this.apply(converted);
        this.pending = converted;
      } else if (pending && previous?.payload) {
        this.pending = mergeChanges(previous.payload, pending, body.payload);
        this.apply(this.pending);
      } else { this.pending = null; this.apply(body.payload); }
      this.remember();
      if (this.pending) await this.flush(); else this.showSaved();
    } catch (error) { this.status('서버 연결 대기 중이에요. 변경 사항은 이 브라우저에 보관됩니다.', true); }
    if (this.interval) this.timer = setInterval(() => this.tick().catch(() => {}), this.interval);
    globalThis.addEventListener?.('online', () => this.tick().catch(() => {}));
    globalThis.document?.addEventListener('visibilitychange', () => { if (!document.hidden) this.tick().catch(() => {}); });
  }
  showSaved() {
    this.status(this.cleanupPending ? '내용은 저장됐어요. 서버 이미지 삭제를 다시 시도하고 있습니다.' : '클라우드에 저장됨', this.cleanupPending);
  }
  queue(payload) {
    this.pending = this.base?.payload ? mergeChanges(this.viewBase, payload, this.base.payload) : structuredClone(payload);
    if (same(this.pending, this.base?.payload)) this.pending = null;
    this.remember();
    if (this.pending) { this.status('클라우드에 저장 중…'); queueMicrotask(() => this.flush().catch(() => {})); }
  }
  async flush() {
    if (this.running) return this.running;
    this.running = this.drain();
    try { return await this.running; } finally { this.running = null; }
  }
  async drain() {
    try {
      if (!this.connected) {
        const { body } = await this.request('state');
        const pending = this.pending;
        const previous = this.base;
        this.base = { revision: body.revision, payload: body.payload };
        this.connected = true;
        if (pending) this.pending = previous?.payload && body.payload ? mergeChanges(previous.payload, pending, body.payload) : body.payload ? body.payload : await this.prepare(pending);
        else if (!body.payload) this.pending = await this.prepare(this.getPayload());
        else { this.apply(body.payload); this.remember(); return; }
      }
      let conflicts = 0;
      while (this.pending) {
        const sent = structuredClone(this.pending);
        const sentUi = structuredClone(this.getPayload());
        const { response, body } = await this.request('state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: this.base.revision, payload: sent }) });
        if (response.status === 409) {
          this.base = { revision: body.revision, payload: body.payload };
          this.pending = mergeChanges(this.viewBase, this.getPayload(), body.payload);
          this.remember();
          if (++conflicts >= 5) throw new Error('다른 기기의 변경 사항을 다시 확인하고 있습니다.');
          continue;
        }
        this.base = { revision: body.revision, payload: body.payload };
        this.cleanupPending = body.cleanupPending;
        this.viewBase = sentUi;
        const latest = mergeChanges(sentUi, this.getPayload(), body.payload);
        this.pending = same(latest, body.payload) ? null : latest;
        if (this.canApply()) this.apply(latest);
        this.remember();
      }
      this.showSaved();
      if (this.cleanupPending) throw new Error('이미지 삭제를 다시 시도하고 있어요.');
    } catch (error) {
      this.remember();
      this.status(error.message || '서버 연결이 끊겼어요. 연결되면 다시 저장합니다.', true);
      throw error;
    }
  }
  async tick() {
    if (this.running || globalThis.document?.hidden) return;
    if (this.pending || !this.connected) return this.flush();
    if (!this.canApply()) return;
    try {
      const { body } = await this.request('state');
      if (!body.payload) return;
      const latest = mergeChanges(this.viewBase, this.getPayload(), body.payload);
      this.base = { revision: body.revision, payload: body.payload };
      this.cleanupPending = body.cleanupPending;
      if (!same(latest, this.getPayload())) this.apply(latest);
      else this.viewBase = structuredClone(latest);
      this.pending = same(latest, body.payload) ? null : latest;
      this.remember();
      if (this.pending) await this.flush(); else this.showSaved();
    } catch (error) { this.status('연결이 끊겼어요. 다시 연결되면 동기화합니다.', true); }
  }
  stop() { clearInterval(this.timer); }
}
