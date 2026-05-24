import { NextResponse } from 'next/server';
import { Address } from 'viem';
import selectSocialWallets from '@/lib/supabase/in_process_artist_social_wallets/selectSocialWallets';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';

const lookupEmail = async (artistAddress: string) => {
  const { data: socialWallets, error } = await selectSocialWallets({
    artistAddress: artistAddress.toLowerCase(),
  });
  if (error) throw new Error(error.message);
  const socialWallet = socialWallets?.[0]?.social_wallet;
  if (!socialWallet) return NextResponse.json({ email: null });
  const email = await getEmailByWalletAddress(socialWallet);
  return NextResponse.json({ email });
};

export default lookupEmail;
