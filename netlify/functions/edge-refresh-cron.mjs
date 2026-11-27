// Every 10 minutes on the published site, start the background refresh.
export default async () => {
  const base = process.env.URL;
  if (!base) return;
  await fetch(`${base}/.netlify/functions/edge-refresh-background`, { method: 'POST' });
};

export const config = { schedule: '*/10 * * * *' };
