import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { ADMIN_ADDRESSES } from '@/lib/consts';
import { selectSocialWallets } from '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';
import getAllEmails from '@/lib/privy/getAllEmails';
import getArtistAddresses from '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses';

const getEmailsHandler = async (
  callerAddress: string,
  artistAddress?: string,
  cursor?: string,
  limit?: number
) => {
  if (artistAddress) {
    const isAdmin = ADMIN_ADDRESSES.includes(callerAddress.toLowerCase());
    const isSelf = callerAddress.toLowerCase() === artistAddress.toLowerCase();
    if (!isAdmin && !isSelf) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const { data: socialWallets, error: socialWalletsError } =
      await selectSocialWallets({
        artistAddress: artistAddress as Address,
      });
    if (socialWalletsError) throw new Error(socialWalletsError.message);
    const socialWallet = socialWallets?.[0]?.social_wallet;
    if (!socialWallet) {
      return NextResponse.json({ email: null });
    }
    const email = await getEmailByWalletAddress(socialWallet);
    return NextResponse.json({ email });
  }

  const isAdmin = ADMIN_ADDRESSES.includes(callerAddress.toLowerCase());
  if (!isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { emails, next_cursor } = await getAllEmails(cursor, limit);

  const { data: walletRows, error } = await getArtistAddresses(
    emails.map((e) => e.address.toLowerCase())
  );
  if (error) throw new Error(error.message);
  const artistAddressMap: Record<
    string,
    { artist_address: string; username: string | null }
  > = {};
  for (const row of walletRows ?? []) {
    artistAddressMap[row.social_wallet.toLowerCase()] = {
      artist_address: row.artist_address,
      username:
        (row.in_process_artists as { username: string } | null)?.username ??
        null,
    };
  }
  const enriched = emails.map((e) => ({
    ...e,
    artist_address:
      artistAddressMap[e.address.toLowerCase()]?.artist_address ?? null,
    username: artistAddressMap[e.address.toLowerCase()]?.username ?? null,
  }));

  return NextResponse.json({ emails: enriched, next_cursor });
};

export default getEmailsHandler;
