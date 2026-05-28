import { NextResponse } from 'next/server';
import { upsertPhone } from '@/lib/supabase/in_process_artist_phones/upsertPhone';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import truncateAddress from '@/lib/truncateAddress';
import { sendSms } from '@/lib/phones/sendSms';
import type { RegisterPhoneInput } from './validateRegisterPhoneBody';

const registerPhoneHandler = async ({
  artist,
  phone_number,
}: RegisterPhoneInput) => {
  const { error: insertError } = await upsertPhone({
    artist_id: artist.artistId,
    phone_number,
    verified: false,
  });

  if (insertError) {
    throw new Error(`Failed to insert phone number: ${insertError.message}`);
  }

  const { data: walletRows } = await selectWallets({
    artistIds: [artist.artistId],
  });
  const username = walletRows?.[0]?.artist?.username;
  const artistName = username || truncateAddress(artist.primaryWallet);

  await sendSms(
    phone_number,
    `Someone is trying to connect this phone number to the artist profile for ${artistName} on In Process. If this was you, please reply 'yes'. If this was not you, please ignore this message.`
  );

  return NextResponse.json({
    success: true,
    message: 'Phone number registered and verification message sent',
  });
};

export default registerPhoneHandler;
