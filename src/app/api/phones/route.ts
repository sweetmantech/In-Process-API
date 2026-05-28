import { NextRequest } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { upsertPhone } from '@/lib/supabase/in_process_artist_phones/upsertPhone';
import { deletePhone } from '@/lib/supabase/in_process_artist_phones/deletePhone';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import truncateAddress from '@/lib/truncateAddress';
import { registerPhoneSchema } from '@/lib/schema/phoneNumberSchema';
import { sendSms } from '@/lib/phones/sendSms';
import { validate } from '@/lib/schema/validate';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { primaryWallet } = authResult;

    // Get and validate phone number from request body
    const body = await req.json();
    const validationResult = validate(registerPhoneSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { phone_number } = validationResult.data;

    // Upsert phone number into Supabase with verified = false
    const { error: insertError } = await upsertPhone({
      artist_address: primaryWallet.toLowerCase(),
      phone_number,
      verified: false,
    });

    if (insertError) {
      throw new Error(`Failed to insert phone number: ${insertError.message}`);
    }

    const { data: walletRows } = await selectWallets({
      addresses: [primaryWallet.toLowerCase()],
    });
    const username = walletRows?.[0]?.artist?.username;
    const artistName = username || truncateAddress(primaryWallet);

    // Send SMS verification message
    await sendSms(
      phone_number,
      `Someone is trying to connect this phone number to the artist profile for ${artistName} on In Process. If this was you, please reply 'yes'. If this was not you, please ignore this message.`
    );

    return Response.json({
      success: true,
      message: 'Phone number registered and verification message sent',
    });
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'Failed to register phone number';
    return Response.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { primaryWallet } = authResult;

    const { error: deleteError } = await deletePhone(
      primaryWallet.toLowerCase()
    );

    if (deleteError) {
      throw new Error(
        `Failed to disconnect phone number: ${deleteError.message}`
      );
    }

    return Response.json({
      success: true,
      message: 'Phone number is disconnected successfully',
    });
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'Failed to disconnect phone number';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
