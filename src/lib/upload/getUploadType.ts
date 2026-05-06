import isMonthlyFreeUploadAvailable from './isMonthlyFreeUploadAvailable';
import getWincCostForBytes from '@/lib/arweave/getWincCostForBytes';
import getUsdcPriceForBytes from '@/lib/arweave/getUsdcPriceForBytes';
import { FREE_TIER_MAX_BYTES } from '@/lib/consts';

type UploadType =
  | { uploadType: 'free'; usdcAmountMicros: bigint }
  | { uploadType: 'paid'; usdcAmountMicros: bigint }
  | { error: string; status: 500 };

const getUploadType = async (
  artistAddress: string,
  sizeBytes: number
): Promise<UploadType> => {
  const winc = await getWincCostForBytes(sizeBytes);
  if (winc === '0') {
    return { uploadType: 'free', usdcAmountMicros: BigInt(0) };
  }

  if (sizeBytes >= FREE_TIER_MAX_BYTES) {
    return {
      uploadType: 'paid',
      usdcAmountMicros: await getUsdcPriceForBytes(sizeBytes),
    };
  }

  const availability = await isMonthlyFreeUploadAvailable(artistAddress);
  if ('error' in availability) {
    return availability;
  }

  if (!availability.available) {
    return {
      uploadType: 'paid',
      usdcAmountMicros: await getUsdcPriceForBytes(sizeBytes),
    };
  }

  return { uploadType: 'free', usdcAmountMicros: BigInt(0) };
};

export default getUploadType;
