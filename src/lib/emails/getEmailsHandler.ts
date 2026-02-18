import { NextResponse } from 'next/server';
import { ADMIN_ADDRESSES } from '@/lib/consts';
import getAllEmails from '@/lib/privy/getAllEmails';
import getArtistAddresses from '@/lib/supabase/in_process_artist_social_wallets/getArtistAddresses';
import lookupEmail from '@/lib/emails/lookupEmail';

const getEmailsHandler = async (
  callerAddress: string,
  artistAddress?: string,
  cursor?: string,
  limit?: number
) => {
  const isAdmin = ADMIN_ADDRESSES.includes(callerAddress.toLowerCase());

  if (!isAdmin) {
    return lookupEmail(callerAddress);
  }

  if (artistAddress) {
    return lookupEmail(artistAddress);
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
