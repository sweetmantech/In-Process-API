import { supabase } from '@/lib/supabase/client';

export async function ensureArtists(addresses: string[]): Promise<void> {
  if (!addresses.length) return;
  const normalized = [...new Set(addresses.map((a) => a.toLowerCase()))];
  try {
    // ignoreDuplicates so we never clobber an existing wallet row that may
    // already have artist UUID / type / smart_wallet_address populated.
    const { error } = await supabase
      .from('in_process_wallets')
      .upsert(
        normalized.map((address) => ({ address })),
        { onConflict: 'address', ignoreDuplicates: true }
      );
    if (error) throw error;
    console.log(`💾 ensureArtists: Upserted ${normalized.length} wallet(s)`);
  } catch (err) {
    console.error('❌ ensureArtists exception:', err);
  }
}
