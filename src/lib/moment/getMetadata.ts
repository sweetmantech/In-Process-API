import { fetchTokenMetadata } from '@/lib/protocolSdk/ipfs/token-metadata';
import selectMetadata from '@/lib/supabase/in_process_metadata/selectMetadata';

const getMetadata = async (momentId: string | null, uri: string) => {
  if (momentId) {
    const cached = await selectMetadata(momentId);
    if (cached) return cached;
  }

  try {
    return await fetchTokenMetadata(uri);
  } catch (err) {
    console.error(err);
    return null;
  }
};

export default getMetadata;
