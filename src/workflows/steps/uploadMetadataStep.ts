import { uploadJson } from '@/lib/arweave/uploadJson';
import { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';

export default async function uploadMetadataStep(
  metadata: TokenMetadataJson,
  arweaveUri: string
): Promise<string> {
  'use step';
  const mimeType = metadata.content?.mime || 'video/mp4';
  const updatedMetadata: TokenMetadataJson = {
    ...metadata,
    animation_url: arweaveUri,
    content: { mime: mimeType, uri: arweaveUri },
  };
  const result = await uploadJson(updatedMetadata);
  return result.arweave_uri;
}
