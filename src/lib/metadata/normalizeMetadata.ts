import fetchUri from '@/lib/arweave/fetchUri';
import type { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';

type NormalizedAttribute = { trait_type: string; value: string | string[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeMetadata = async (
  raw: any,
  contentUriOverride?: string
): Promise<
  Omit<TokenMetadataJson, 'attributes'> & {
    attributes?: NormalizedAttribute[];
  }
> => {
  const body = raw?.body ?? raw;
  const hasWrappedBody = raw?.body !== undefined;

  // Resolve animation URI: prefer animation_url (if non-empty), fall back to losslessAudio
  const animationUri: string | undefined =
    body.animation_url || body.losslessAudio || undefined;

  // Resolve image from common metadata shapes, including Catalog's body.artwork.info.uri
  const image: string | undefined =
    body.image ?? body.artwork?.uri ?? body.artwork?.info?.uri ?? undefined;

  // Resolve content: prefer explicit content field, fall back to mimeType + animationUri,
  // then fall back to fetching animationUri (or imageUri) HEAD to detect mime from content-type header
  const contentUri = contentUriOverride ?? animationUri ?? image;
  let content: { mime: string; uri: string } | null = body.content ?? null;
  if (!content && contentUri && hasWrappedBody && body.mimeType) {
    content = { mime: body.mimeType, uri: contentUri };
  }
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
  const attributes: NormalizedAttribute[] = [...(body.attributes ?? [])];
  if (body.genre) {
    const genres = Array.isArray(body.genre) ? body.genre : [body.genre];
    attributes.push({ trait_type: 'Genres', value: genres });
  }

  return {
    name: body.title ?? body.name,
    ...(body.artist !== undefined && { artist: body.artist }),
    ...(body.external_url !== undefined && { external_url: body.external_url }),
    ...((body.description ?? body.notes) !== undefined && {
      description: body.description ?? body.notes,
    }),
    ...(image !== undefined && { image }),
    ...(animationUri !== undefined && { animation_url: animationUri }),
    ...(content !== null && { content }),
    ...(attributes.length > 0 && { attributes }),
  };
};

export default normalizeMetadata;
