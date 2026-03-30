import type { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';

type NormalizedArtwork = { uri: string; mimeType: string };
type NormalizedAttribute = { trait_type: string; value: string | string[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeMetadata = (
  raw: any
): Omit<TokenMetadataJson, 'attributes'> & {
  attributes?: NormalizedAttribute[];
  artwork?: NormalizedArtwork;
} => {
  // Resolve content: prefer explicit content field, fall back to mimeType + animation_url (e.g. Catalog format)
  let content: { mime: string; uri: string } | null = raw.content ?? null;
  if (!content && raw.mimeType && raw.animation_url) {
    content = { mime: raw.mimeType, uri: raw.animation_url };
  }

  // Resolve image: prefer explicit image field, fall back to artwork.uri
  const image: string | undefined = raw.image ?? raw.artwork?.uri ?? undefined;

  // Resolve artwork: prefer explicit artwork object, fall back to image uri
  let artwork: NormalizedArtwork | undefined;
  if (raw.artwork?.uri && raw.artwork?.mimeType) {
    artwork = { uri: raw.artwork.uri, mimeType: raw.artwork.mimeType };
  } else if (image) {
    artwork = { uri: image, mimeType: 'image/jpeg' };
  }

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
    ...(raw.animation_url !== undefined && {
      animation_url: raw.animation_url,
    }),
    ...(content !== null && { content }),
    ...(artwork !== undefined && { artwork }),
    ...(attributes.length > 0 && { attributes }),
  };
};

export default normalizeMetadata;
