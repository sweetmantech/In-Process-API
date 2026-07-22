import type {
  Catalog_Moments_t,
  InProcess_Moments_t,
  Sound_Moments_t,
  Zora_Moments_t,
  ZoraMedia_Moments_t,
} from '@/types/envio';

type AnyMoment =
  | InProcess_Moments_t
  | Catalog_Moments_t
  | Sound_Moments_t
  | Zora_Moments_t
  | ZoraMedia_Moments_t;

export type MomentUriEntry = {
  contentUri?: string;
};

/**
 * Builds a map keyed by "collection:tokenId".
 * For ZoraMedia moments, extracts contentUri (uri field)
 * since the stored uri is metadata_uri, not the content uri.
 */
export function getMomentUris(
  moments: AnyMoment[]
): Map<string, MomentUriEntry> {
  const map = new Map<string, MomentUriEntry>();
  for (const moment of moments) {
    const tokenId =
      'tier' in moment ? String(moment.tier + 1) : String(moment.token_id);
    const key = `${moment.collection}:${tokenId}`;
    if ('metadata_uri' in moment && moment.metadata_uri) {
      map.set(key, {
        contentUri: moment.uri ?? undefined,
      });
    }
  }
  return map;
}
