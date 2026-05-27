import { NextResponse } from 'next/server';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';

const lookupEmail = async (artistAddress: string) => {
  const { data: walletRows } = await selectWallets({
    addresses: [artistAddress.toLowerCase()],
  });
  const artistId = walletRows?.[0]?.artist;
  if (!artistId) return NextResponse.json({ email: null });

  const { data: privyRows } = await selectWallets({
    artistIds: [artistId],
    type: 'privy',
  });
  const socialWallet = privyRows?.[0]?.address;
  if (!socialWallet) return NextResponse.json({ email: null });

  const email = await getEmailByWalletAddress(socialWallet);
  return NextResponse.json({ email });
};

export default lookupEmail;
