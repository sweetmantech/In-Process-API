import { uploadJson } from '@/lib/arweave/uploadJson';
import { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';

export default async function uploadMigratedMetadataStep(
  metadata: TokenMetadataJson,
  urlMap: Map<string, string>
): Promise<string> {
  'use step';
  const updated: TokenMetadataJson = { ...metadata };
  if (urlMap.has('image')) updated.image = urlMap.get('image');
  if (urlMap.has('animation_url'))
    updated.animation_url = urlMap.get('animation_url');
  if (urlMap.has('content.uri') && updated.content)
    updated.content = { ...updated.content, uri: urlMap.get('content.uri')! };

  const result = await uploadJson(updated);
  return result.arweave_uri;
}
