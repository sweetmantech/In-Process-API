import { NextRequest, NextResponse } from 'next/server';
import type { Address } from 'viem';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import uploadBodySchema from '@/lib/schema/uploadBodySchema';
import getBlob from '@/lib/getBlob';
import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';
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
  const artistAddress = authResult.artistAddress;

  const { blob, type } = await getBlob(url);

  if (authResult.isOfficialArtist) {
    return {
      artistAddress,
      blob,
      type,
      uploadType: 'free' as const,
      usdcAmountMicros: BigInt(0),
    };
  }

  const uploadTypeResult = await getUploadType(artistAddress, blob.size);
  if ('error' in uploadTypeResult) {
    return NextResponse.json(
      { message: uploadTypeResult.error },
      { status: uploadTypeResult.status }
    );
  }

  if (uploadTypeResult.uploadType === 'paid') {
    let smartWalletAddress: Address;
    try {
      smartWalletAddress = await getSmartWalletAddress(
        artistAddress as Address
      );
    } catch {
      return NextResponse.json(
        { message: 'Failed to resolve smart wallet' },
        { status: 500 }
      );
    }

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

  return { artistAddress, blob, type, ...uploadTypeResult };
};

export default validateUpload;
