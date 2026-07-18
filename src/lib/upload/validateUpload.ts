import { NextRequest, NextResponse } from 'next/server';
import type { Address } from 'viem';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import uploadBodySchema from '@/lib/schema/uploadBodySchema';
import getBlob from '@/lib/getBlob';
import getArtistSmartWallet from '@/lib/smartwallets/getArtistSmartWallet';
import getSmartWalletUsdcBalance from '@/lib/smartwallets/getSmartWalletUsdcBalance';
import getUploadType from './getUploadType';

const validateUpload = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = validate(uploadBodySchema, body);
  if (!parsed.success) return parsed.response;

  const { url } = parsed.data;

  const { blob, type } = await getBlob(url);

  const uploadTypeResult = await getUploadType(
    authResult.primaryWallet,
    blob.size
  );
  if ('error' in uploadTypeResult) {
    return NextResponse.json(
      { message: uploadTypeResult.error },
      { status: uploadTypeResult.status }
    );
  }

  if (uploadTypeResult.uploadType === 'paid') {
    const smartWalletAddress = await getArtistSmartWallet(authResult.artistId);

    const usdcBalance = await getSmartWalletUsdcBalance(smartWalletAddress);
    if (usdcBalance < uploadTypeResult.usdcAmountMicros) {
      return NextResponse.json(
        {
          message: `Insufficient USDC balance in smart wallet ${smartWalletAddress.toLowerCase()}`,
          required: uploadTypeResult.usdcAmountMicros.toString(),
          available: usdcBalance.toString(),
          smart_wallet: smartWalletAddress.toLowerCase(),
        },
        { status: 402 }
      );
    }
  }

  return { artist: authResult, blob, type, ...uploadTypeResult };
};

export default validateUpload;
