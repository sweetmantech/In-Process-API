import fetchUri from '@/lib/arweave/fetchUri';
import { MomentMetadata } from '@/types/moment';

const getMomentMime = async (
  tokenMetadataURI: string
): Promise<string | null> => {
  const response = await fetchUri(tokenMetadataURI);
  const metadata: MomentMetadata = await response.json();
  return metadata?.content?.mime ?? null;
};

export default getMomentMime;
