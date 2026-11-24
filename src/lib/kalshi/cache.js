// Small in-memory cache with shared in-flight requests. On Netlify a warm
// function instance reuses it; the CDN headers below cover the cold ones.
const store = new Map();

export async function cached(key, ttlMs, load) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.promise;
  const promise = load();
  store.set(key, { promise, expires: Date.now() + ttlMs });
  try {
    const value = await promise;
    // A partial scan is only worth keeping briefly.
    if (value?.universe && !value.universe.complete) store.get(key).expires = Date.now() + Math.min(ttlMs, 60000);
    return value;
  } catch (err) {
    store.delete(key);
    throw err;
  }
}

export function cacheHeaders(seconds) {
  return {
    'Cache-Control': 'public, max-age=30',
    'Netlify-CDN-Cache-Control': `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}, durable`,
  };
}
