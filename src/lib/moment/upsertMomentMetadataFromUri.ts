import { upsertMetadata } from '@/lib/supabase/in_process_metadata/upsertMetadata';
import getMetadataHandler from '@/lib/metadata/getMetadataHandler';

const upsertMomentMetadataFromUri = async (momentId: string, uri: string) => {
  try {
    const data = await getMetadataHandler({ uri });
    await upsertMetadata([
      {
        moment: momentId,
        name: data.name ?? null,
        description: data.description ?? null,
        image: data.image ?? null,
        animation_url: data.animation_url ?? null,
        external_url: data.external_url ?? null,
        content: data.content ?? null,
      },
    ]);
  } catch (e) {
    console.error(
      '[upsertMomentMetadataFromUri] failed to upsert metadata:',
      e
    );
  }
};

export default upsertMomentMetadataFromUri;
