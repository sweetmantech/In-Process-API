import getMetadataHandler from '@/lib/metadata/getMetadataHandler';
import { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';

export default async function fetchMetadataStep(
  uri: string
): Promise<TokenMetadataJson> {
  'use step';
  const metadata = await getMetadataHandler({ uri });
  if (!metadata) throw new Error(`Failed to fetch metadata for URI: ${uri}`);
  return metadata as TokenMetadataJson;
}
