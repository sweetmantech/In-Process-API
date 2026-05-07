const isPrivateVercelBlob = (url: string) =>
  /\.private\.blob\.vercel-storage\.com/.test(url);

export default isPrivateVercelBlob;
