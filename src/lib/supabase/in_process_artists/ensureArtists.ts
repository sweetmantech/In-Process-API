import type { Database } from '@/lib/supabase/types';
import { upsertArtists } from './upsertArtists';

export async function ensureArtists(addresses: string[]): Promise<void> {
  if (!addresses.length) return;
  const artists: Database['public']['Tables']['in_process_artists']['Insert'][] =
    [...new Set(addresses.map((addr) => addr.toLowerCase()))].map(
      (address) => ({
        address,
      })
    );
  try {
    await upsertArtists(artists);
  } catch (err) {
    console.error('❌ ensureArtists exception:', err);
  }
}
