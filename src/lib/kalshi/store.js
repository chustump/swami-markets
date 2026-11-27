// Where the latest full scan lives between requests. On Netlify this is a Blobs
// store written by the background refresh; anywhere else it quietly does nothing
// and callers fall back to scanning inside the request.
const STORE = 'edge-scanner';

async function store() {
  try {
    const { getStore } = await import('@netlify/blobs');
    return getStore(STORE);
  } catch {
    return null;
  }
}

export async function readScan() {
  try {
    const s = await store();
    const data = s ? await s.get('scan', { type: 'json' }) : null;
    return data ? { data, ageMs: Date.now() - new Date(data.generated).getTime() } : null;
  } catch {
    return null;
  }
}

export async function writeScan(data) {
  const s = await store();
  if (!s) throw new Error('Blob store unavailable');
  await s.setJSON('scan', data);
}

// A simple "someone is already refreshing" marker so refreshes do not pile up.
export async function claimRefresh(minGapMs) {
  try {
    const s = await store();
    if (!s) return false;
    const last = await s.get('refresh-started', { type: 'json' });
    if (last && Date.now() - last.at < minGapMs) return false;
    await s.setJSON('refresh-started', { at: Date.now() });
    return true;
  } catch {
    return false;
  }
}
