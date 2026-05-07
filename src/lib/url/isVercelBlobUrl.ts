const isVercelBlobUrl = (url: string) =>
  /\.blob\.vercel-storage\.com/.test(url);

export default isVercelBlobUrl;
