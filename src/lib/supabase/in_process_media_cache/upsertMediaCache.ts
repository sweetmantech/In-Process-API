import { supabase } from '@/lib/supabase/client';

const upsertMediaCache = async ({
  hash,
  path,
  kind = 'image',
}: {
  hash: string;
  path: string;
  kind?: string;
}): Promise<void> => {
  const { error } = await supabase.from('in_process_media_cache').upsert(
    {
      hash,
      path,
      kind,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'hash' }
  );
  if (error) {
    console.error('Media cache row upsert failed:', error.message);
  }
};

export default upsertMediaCache;
