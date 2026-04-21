import type { Database } from '@/lib/supabase/types';
import getMetadataHandler from '@/lib/metadata/getMetadataHandler';
import getMimeType from '@/lib/arweave/getMimeType';
import sleep from '@/lib/sleep';
import { getRetryDelay } from '@/lib/getRetryDelay';

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 1000;

export type MapMetadataResult = {
  records: Array<Database['public']['Tables']['in_process_metadata']['Insert']>;
  artistNamesByAddresses: Map<string, string>;
};

export async function mapMetadataToSupabase(
  moments: Array<{
    id: string;
    uri: string;
    contentUri?: string;
    owner?: string;
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
    moments.map(async ({ id, uri, contentUri, owner, collection }) => {
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
          const data = await getMetadataHandler({ uri });
          if (contentUri) {
            const mime = await getMimeType(contentUri);
            if (mime) data.content = { mime, uri: contentUri };
            data.animation_url = contentUri;
          }
          const creatorAddress = owner ?? collection.creator;
          if (data?.artist)
            artistNamesByAddresses.set(creatorAddress, data.artist);
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
          const isLastAttempt = attempt === MAX_ATTEMPTS - 1;
          if (isLastAttempt) break;
          await sleep(getRetryDelay(err, attempt, BASE_DELAY_MS));
        }
      }
      if (lastErr)
        console.error(`❌ Failed to fetch metadata for uri ${uri}:`, lastErr);
    })
  );

  return { records, artistNamesByAddresses };
}
