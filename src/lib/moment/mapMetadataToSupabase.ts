import type { Database } from '@/lib/supabase/types';
import getMetadataHandler from '@/lib/metadata/getMetadataHandler';
import sleep from '@/lib/sleep';

export type MapMetadataResult = {
  records: Array<Database['public']['Tables']['in_process_metadata']['Insert']>;
  artistNamesByAddresses: Map<string, string>;
};

export async function mapMetadataToSupabase(
  moments: Array<{ id: string; uri: string; collection: { creator: string } }>
): Promise<MapMetadataResult> {
  if (!moments.length)
    return { records: [], artistNamesByAddresses: new Map() };

  const records: Array<
    Database['public']['Tables']['in_process_metadata']['Insert']
  > = [];
  const artistNamesByAddresses = new Map<string, string>();

  await Promise.all(
    moments.map(async ({ id, uri, collection }) => {
      let lastErr: unknown;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const data = await getMetadataHandler(uri);
          if (data?.artist)
            artistNamesByAddresses.set(collection.creator, data.artist);
          records.push({
            moment: id,
            name: data.name ?? null,
            description: data.description ?? null,
            image: data.image ?? null,
            animation_url: data.animation_url ?? null,
            external_url: data.external_url ?? null,
            content: data.content ?? null,
          });
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          if (attempt < 3) await sleep(500 * attempt);
        }
      }
      if (lastErr)
        console.error(`❌ Failed to fetch metadata for uri ${uri}:`, lastErr);
    })
  );

  return { records, artistNamesByAddresses };
}
