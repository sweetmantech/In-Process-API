import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';

export async function ensureArtists(addresses: string[]): Promise<void> {
  if (!addresses.length) return;
  const normalized = [...new Set(addresses.map((a) => a.toLowerCase()))];
  try {
    // ignoreDuplicates so we never clobber an existing wallet row that may
    // already have artist UUID / type / smart_wallet_address populated.
    await upsertWallets(
      normalized.map((address) => ({ address })),
      { ignoreDuplicates: true }
    );
    console.log(`💾 ensureArtists: Upserted ${normalized.length} wallet(s)`);
  } catch (err) {
    console.error('❌ ensureArtists exception:', err);
  }
}
