import fetchUri from '@/lib/arweave/fetchUri';

const getMomentMime = async (uri: string): Promise<string | null> => {
  const response = await fetchUri(uri);
  const data = await response.json();
  return data?.content?.mime ?? null;
};

export default getMomentMime;
