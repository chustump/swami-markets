// Recent headlines for a market, with a rough relevance and tone score.
// Both scores are word counts, not a language model: cheap, fast and transparent.

const FEED =
  process.env.NEWS_FEED_URL || 'https://news.google.com/rss/search?q={q}+when:7d&hl=en-US&gl=US&ceid=US:en';

const STOP = new Set(
  'a an the of in on at to for by with from and or will be is are was were this that it its as than then before after above below over under between more less least most yes no not who what when which how many much any win wins winner price points point total game match vs at least up down'.split(' ')
);
const POS = 'win wins won surge surges soar soars rise rises rally rallies gain gains beat beats lead leads leading record strong boost boosts approve approves approved pass passes passed deal agree agrees agreement ahead favorite favored likely confirm confirms confirmed secure secures clinch clinches jump jumps climbs climb upgrade success breakthrough tops'.split(' ');
const NEG = 'lose loses lost fall falls drop drops plunge plunges slump slumps crash crashes miss misses missed fail fails failed reject rejects rejected delay delays delayed doubt doubts unlikely injury injured out suspended cut cuts weak trail trails trailing collapse collapses ban blocked block blocks stall stalls stalled downgrade concern concerns warning warns struggle struggles'.split(' ');
const posSet = new Set(POS);
const negSet = new Set(NEG);

const words = (s) => (s || '').toLowerCase().replace(/[^a-z0-9$% ]+/g, ' ').split(/\s+/).filter(Boolean);
export const keywords = (text) => [...new Set(words(text).filter((w) => w.length > 2 && !STOP.has(w)))];

const decode = (s) =>
  s.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]).trim() : '';
};

export function scoreHeadline(title, keys) {
  const w = new Set(words(title));
  const hits = keys.filter((k) => w.has(k)).length;
  const relevance = keys.length ? hits / Math.min(keys.length, 4) : 0;
  let tone = 0;
  for (const x of w) tone += posSet.has(x) ? 1 : negSet.has(x) ? -1 : 0;
  return { relevance: Math.min(1, relevance), tone: Math.max(-1, Math.min(1, tone)) };
}

export async function newsFor(topic, { signal, max = 5 } = {}) {
  const keys = keywords(topic).slice(0, 6);
  if (keys.length < 2) return { items: [], tone: 0 };
  try {
    const r = await fetch(FEED.replace('{q}', encodeURIComponent(keys.join(' '))), { signal, cache: 'no-store' });
    if (!r.ok) return { items: [], tone: 0 };
    const xml = await r.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 20)
      .map((m) => {
        const raw = tag(m[1], 'title');
        const source = tag(m[1], 'source');
        const title = source && raw.endsWith(` - ${source}`) ? raw.slice(0, -source.length - 3) : raw;
        return { title, source, url: tag(m[1], 'link'), published: tag(m[1], 'pubDate'), ...scoreHeadline(title, keys) };
      })
      .filter((n) => n.relevance >= 0.5)
      .sort((a, b) => b.relevance - a.relevance || new Date(b.published) - new Date(a.published))
      .slice(0, max);
    const weight = items.reduce((s, n) => s + n.relevance, 0);
    const tone = weight ? items.reduce((s, n) => s + n.tone * n.relevance, 0) / weight : 0;
    return { items, tone: +tone.toFixed(2) };
  } catch {
    return { items: [], tone: 0 };
  }
}
