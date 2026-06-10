import { NextResponse } from 'next/server';
import type { ArtistContext } from '@/types/artist';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import topUpTurboCredits from '@/lib/arweave/topUpTurboCredits';

const uploadHandler = async (
  artist: ArtistContext,
  blob: Blob,
  contentType: string,
  uploadType: 'free' | 'paid',
  usdcAmountMicros: bigint
) => {
  if (uploadType === 'paid' && artist.artistId) {
    await topUpTurboCredits(artist.artistId, usdcAmountMicros);
  }

  const file = new File([blob], 'upload', { type: contentType });
  const uploadResult = await uploadToArweave(file);
  logArweaveUpload(uploadResult, {
    file_size_bytes: blob.size,
    content_type: contentType,
    artist_address: artist.primaryWallet,
  });

  return NextResponse.json({ uri: uploadResult.arweave_uri });
};

export default uploadHandler;
