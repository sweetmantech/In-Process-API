import type { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeMetadata = (
  raw: any
): Omit<TokenMetadataJson, 'attributes'> & {
  attributes?: TokenMetadataJson['attributes'];
} => {
  // Resolve content: prefer explicit content field, fall back to mimeType + animation_url (e.g. Catalog format)
  let content: { mime: string; uri: string } | null = raw.content ?? null;
  if (!content && raw.mimeType && raw.animation_url) {
    content = { mime: raw.mimeType, uri: raw.animation_url };
  }

  // Resolve image: prefer explicit image field, fall back to artwork.uri
  const image: string | undefined = raw.image ?? raw.artwork?.uri ?? undefined;

  return {
    name: raw.title ?? raw.name,
    ...(raw.external_url !== undefined && { external_url: raw.external_url }),
    ...(raw.description !== undefined && { description: raw.description }),
    ...(image !== undefined && { image }),
    ...(raw.animation_url !== undefined && {
      animation_url: raw.animation_url,
    }),
    ...(content !== null && { content }),
    ...(raw.attributes !== undefined && { attributes: raw.attributes }),
  };
};

export default normalizeMetadata;
