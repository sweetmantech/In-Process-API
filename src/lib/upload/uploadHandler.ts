import { NextResponse } from 'next/server';
import type { Address } from 'viem';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import topUpTurboCredits from '@/lib/arweave/topUpTurboCredits';

const uploadHandler = async (
  artistAddress: string,
  blob: Blob,
  contentType: string,
  uploadType: 'free' | 'paid',
  usdcAmountMicros: bigint
) => {
  if (uploadType === 'paid') {
    await topUpTurboCredits(artistAddress as Address, usdcAmountMicros);
  }

  const file = new File([blob], 'upload', { type: contentType });
  const uploadResult = await uploadToArweave(file);
  logArweaveUpload(uploadResult, {
    file_size_bytes: blob.size,
    content_type: contentType,
    artist_address: artistAddress,
  });

  return NextResponse.json({ uri: uploadResult.arweave_uri });
};

export default uploadHandler;
