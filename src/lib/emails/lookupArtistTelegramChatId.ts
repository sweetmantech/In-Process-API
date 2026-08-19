import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';

const lookupArtistTelegramChatId = async (
  artistAddress: string
): Promise<string | null> => {
  const { data: walletRows } = await selectWallets({
    addresses: [artistAddress.toLowerCase()],
  });

  const artistId = walletRows?.[0]?.artist_id;
  if (!artistId) return null;

  const { data: artistWalletRows } = await selectWallets({
    artistIds: [artistId],
  });

  const wallets = (artistWalletRows ?? []).map((wallet) =>
    wallet.address.toLowerCase()
  );
  if (!wallets.length) return null;

  const notification = await selectAccountNotification({ wallets });

  console.log('[collect-telegram-lookup][dev] notification found', {
    hasTelegramChatId: Boolean(notification?.telegram_chat_id),
  });

  return notification?.telegram_chat_id ?? null;
};

export default lookupArtistTelegramChatId;
