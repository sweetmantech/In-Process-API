import type { Database } from '@/lib/supabase/types';
import getMetadataHandler from '@/lib/metadata/getMetadataHandler';
import getMimeType from '@/lib/arweave/getMimeType';
import { retriesGeneric } from '@/lib/protocolSdk/retries';
import resolveAddressDisplayName from '@/lib/artists/resolveAddressDisplayName';

export type MapMetadataResult = {
  records: Array<Database['public']['Tables']['in_process_metadata']['Insert']>;
  artistNamesByAddresses: Map<string, string>;
};

export async function mapMetadataToSupabase(
  moments: Array<{
    id: string;
    uri: string;
    contentUri?: string;
    collection: { creator: string };
  }>
): Promise<MapMetadataResult> {
  if (!moments.length)
    return { records: [], artistNamesByAddresses: new Map() };

  const records: Array<
    Database['public']['Tables']['in_process_metadata']['Insert']
  > = [];
  const artistNamesByAddresses = new Map<string, string>();

  await Promise.all(
    moments.map(async ({ id, uri, contentUri, collection }) => {
      try {
        await retriesGeneric({
          maxTries: 4,
          linearBackoffMS: 1000,
          tryFn: async () => {
            const data = await getMetadataHandler({ uri });
            if (contentUri) {
              const mime = await getMimeType(contentUri);
              data.content = {
                mime: mime ?? data.content?.mime ?? '',
                uri: contentUri,
              };
              data.animation_url = contentUri;
            }
            const creatorAddress = collection.creator;
            if (data?.artist) {
              artistNamesByAddresses.set(creatorAddress, data.artist);
            } else if (!artistNamesByAddresses.has(creatorAddress)) {
              const resolvedName =
                await resolveAddressDisplayName(creatorAddress);
              if (resolvedName)
                artistNamesByAddresses.set(creatorAddress, resolvedName);
            }
            records.push({
              moment: id,
              name: data.name ?? null,
              description: data.description ?? null,
              image: data.image ?? null,
              animation_url: data.animation_url ?? null,
              external_url: data.external_url ?? null,
              content: data.content ?? null,
            });
          },
        });
      } catch (lastErr) {
        console.error(`❌ Failed to fetch metadata for uri ${uri}:`, lastErr);
      }
    })
  );

  return { records, artistNamesByAddresses };
}
