import fetchUri from '@/lib/arweave/fetchUri';
import type { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';

type NormalizedAttribute = { trait_type: string; value: string | string[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeMetadata = async (
  raw: any
): Promise<
  Omit<TokenMetadataJson, 'attributes'> & {
    attributes?: NormalizedAttribute[];
  }
> => {
  // Resolve animation URI: prefer animation_url (if non-empty), fall back to losslessAudio
  const animationUri: string | undefined =
    raw.animation_url || raw.losslessAudio || undefined;

  // Resolve image: prefer explicit image field, fall back to artwork.uri
  const image: string | undefined = raw.image ?? raw.artwork?.uri ?? undefined;

  // Resolve content: prefer explicit content field, fall back to mimeType + animationUri,
  // then fall back to fetching animationUri (or imageUri) HEAD to detect mime from content-type header
  const contentUri = animationUri ?? image;
  let content: { mime: string; uri: string } | null = raw.content ?? null;
  if (!content && contentUri) {
    try {
      const res = await fetchUri(contentUri, { method: 'HEAD' });
      if (res.ok) {
        const mime = res.headers.get('content-type');
        if (mime) {
          content = { mime: mime.split(';')[0].trim(), uri: contentUri };
        }
      }
    } catch {
      // leave content as null if fetch fails
    }
  }

  // Resolve attributes: start from raw attributes, then inject genre as Genres
  const attributes: NormalizedAttribute[] = [...(raw.attributes ?? [])];
  if (raw.genre) {
    const genres = Array.isArray(raw.genre) ? raw.genre : [raw.genre];
    attributes.push({ trait_type: 'Genres', value: genres });
  }

  return {
    name: raw.title ?? raw.name,
    ...(raw.artist !== undefined && { artist: raw.artist }),
    ...(raw.external_url !== undefined && { external_url: raw.external_url }),
    ...(raw.description !== undefined && { description: raw.description }),
    ...(image !== undefined && { image }),
    ...(animationUri !== undefined && { animation_url: animationUri }),
    ...(content !== null && { content }),
    ...(attributes.length > 0 && { attributes }),
  };
};

export default normalizeMetadata;
