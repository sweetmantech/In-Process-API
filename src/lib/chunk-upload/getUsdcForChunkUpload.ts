import { parseUnits, type Address } from 'viem';
import getUsdcPriceForBytes from '@/lib/arweave/getUsdcPriceForBytes';
import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';
import getSmartWalletUsdcBalance from '@/lib/smartwallets/getSmartWalletUsdcBalance';

type UsdcForChunkUpload =
  | { usdcAmount: number }
  | { error: string; status: 402 | 500; required?: string; available?: string };

const getUsdcForChunkUpload = async (
  artistAddress: string,
  totalSizeBytes: number
): Promise<UsdcForChunkUpload> => {
  const usdcAmount = await getUsdcPriceForBytes(totalSizeBytes);

  let smartWalletAddress: Address;
  try {
    smartWalletAddress = await getSmartWalletAddress(artistAddress as Address);
  } catch {
    return { error: 'Failed to resolve smart wallet', status: 500 };
  }

  const usdcBalance = await getSmartWalletUsdcBalance(smartWalletAddress);
  const requiredMicroUsdc = parseUnits(usdcAmount.toString(), 6);

  if (usdcBalance < requiredMicroUsdc) {
    return {
      error: 'Insufficient USDC balance in smart wallet',
      status: 402,
      required: requiredMicroUsdc.toString(),
      available: usdcBalance.toString(),
    };
  }

  return { usdcAmount };
};

export default getUsdcForChunkUpload;
