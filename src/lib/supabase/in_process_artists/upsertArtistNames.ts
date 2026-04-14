import { supabase } from '@/lib/supabase/client';

export async function upsertArtistNames(
  artistNamesByAddresses: Map<string, string>
): Promise<void> {
  if (!artistNamesByAddresses.size) return;
  const artists = [...artistNamesByAddresses.entries()].map(
    ([address, username]) => ({ address, username })
  );
  const { error } = await supabase.rpc('upsert_artist_names', { artists });
  if (error) throw error;
}
