import type { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';

type NormalizedAttribute = { trait_type: string; value: string | string[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeMetadata = (
  raw: any
): Omit<TokenMetadataJson, 'attributes'> & {
  attributes?: NormalizedAttribute[];
} => {
  // Resolve audio URI: prefer animation_url (if non-empty), fall back to losslessAudio
  const audioUri: string | undefined =
    raw.animation_url || raw.losslessAudio || undefined;

  // Resolve content: prefer explicit content field, fall back to mimeType + audioUri
  let content: { mime: string; uri: string } | null = raw.content ?? null;
  if (!content && raw.mimeType && audioUri) {
    content = { mime: raw.mimeType, uri: audioUri };
  }

  // Resolve image: prefer explicit image field, fall back to artwork.uri
  const image: string | undefined = raw.image ?? raw.artwork?.uri ?? undefined;

  // Resolve attributes: start from raw attributes, then inject genre as Genres
  const attributes: NormalizedAttribute[] = [...(raw.attributes ?? [])];
  if (raw.genre) {
    const genres = Array.isArray(raw.genre) ? raw.genre : [raw.genre];
    attributes.push({ trait_type: 'Genres', value: genres });
  }

  return {
    name: raw.title ?? raw.name,
    ...(raw.external_url !== undefined && { external_url: raw.external_url }),
    ...(raw.description !== undefined && { description: raw.description }),
    ...(image !== undefined && { image }),
    ...(audioUri !== undefined && { animation_url: audioUri }),
    ...(content !== null && { content }),
    ...(attributes.length > 0 && { attributes }),
  };
};

export default normalizeMetadata;
