import { NextResponse } from 'next/server';
import { deletePhone } from '@/lib/supabase/in_process_artist_phones/deletePhone';
import type { DeletePhoneInput } from './validateDeletePhone';

const deletePhoneHandler = async ({ artist }: DeletePhoneInput) => {
  const { error: deleteError } = await deletePhone(artist.artistId);

  if (deleteError) {
    throw new Error(
      `Failed to disconnect phone number: ${deleteError.message}`
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Phone number is disconnected successfully',
  });
};

export default deletePhoneHandler;
