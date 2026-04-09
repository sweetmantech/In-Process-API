const neynarFetch = async (path: string): Promise<unknown> => {
  const res = await fetch(`https://api.neynar.com${path}`, {
    headers: { 'x-api-key': process.env.NEYNAR_API_KEY! },
  });
  if (!res.ok) throw new Error(`Neynar API error: ${res.status}`);
  return res.json();
};

export default neynarFetch;
