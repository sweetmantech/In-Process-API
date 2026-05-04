import { NextResponse } from 'next/server';
import { insertSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet';
import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import { updateArtistAddress } from '@/lib/supabase/in_process_api_keys/updateArtistAddress';
import { ensureArtists } from './ensureArtists';

const connectArtistWalletHandler = async ({
  artist_wallet,
  social_wallet,
}: {
  artist_wallet: string;
  social_wallet: string;
}) => {
  const artistWalletLc = artist_wallet.toLowerCase();
  const socialWalletLc = social_wallet.toLowerCase();

  await ensureArtists([artistWalletLc]);

  const { data: apiKeys } = await getApiKeys(socialWalletLc);

  if (apiKeys?.length) {
    const apiKeyId = apiKeys[0].id;
    await updateArtistAddress(apiKeyId, artistWalletLc);
  }

  const { error: insertError } = await insertSocialWallet({
    artist_address: artistWalletLc,
    social_wallet: socialWalletLc,
  });
  if (insertError) throw new Error('social_wallet is connected already.');
  return NextResponse.json({ success: true });
};

export default connectArtistWalletHandler;
