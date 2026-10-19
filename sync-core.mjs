const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const safeKeys = (value) => Object.keys(value || {}).filter((key) => !['__proto__', 'constructor', 'prototype'].includes(key));
// Merge changes since the common server snapshot. Deletions win over edits.
export function mergeChanges(base, local, remote) {
  if (equal(local, base)) return structuredClone(remote);
  if (equal(remote, base) || equal(local, remote)) return structuredClone(local);
  if (local === undefined || remote === undefined) return undefined;
  if (Array.isArray(local) && Array.isArray(remote) && [...local, ...remote, ...(base || [])].every((item) => object(item) && typeof item.id === 'string')) {
    const previous = new Map((base || []).map((item) => [item.id, item]));
    const ours = new Map(local.map((item) => [item.id, item]));
    const theirs = new Map(remote.map((item) => [item.id, item]));
    const reordered = !equal(local.filter((item) => previous.has(item.id)).map((item) => item.id), (base || []).filter((item) => ours.has(item.id)).map((item) => item.id));
    const order = [...new Set([...(reordered ? local : remote).map((item) => item.id), ...local.map((item) => item.id), ...remote.map((item) => item.id)])];
    return order.map((id) => mergeChanges(previous.get(id), ours.get(id), theirs.get(id))).filter((item) => item !== undefined);
  }
  if (object(local) && object(remote)) {
    const result = {};
    for (const key of new Set([...safeKeys(base), ...safeKeys(local), ...safeKeys(remote)])) {
      const merged = mergeChanges(base?.[key], local[key], remote[key]);
      if (merged !== undefined) result[key] = merged;
    }
    return result;
  }
  return structuredClone(local);
}
