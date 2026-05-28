import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';

export async function ensureWallets(addresses: string[]): Promise<void> {
  if (!addresses.length) return;
  const normalized = [...new Set(addresses.map((a) => a.toLowerCase()))];
  try {
    // ignoreDuplicates so we never clobber an existing wallet row that may
    // already have artist UUID / type populated.
    await upsertWallets(
      normalized.map((address) => ({ address })),
      { ignoreDuplicates: true }
    );
  } catch (err) {
    console.error('❌ ensureWallets exception:', err);
  }
}
