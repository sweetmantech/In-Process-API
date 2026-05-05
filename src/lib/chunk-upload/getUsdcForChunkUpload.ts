import type { Address } from 'viem';
import getUsdcPriceForBytes from '@/lib/arweave/getUsdcPriceForBytes';
import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';
import getSmartWalletUsdcBalance from '@/lib/smartwallets/getSmartWalletUsdcBalance';

type UsdcForChunkUpload =
  | { usdcAmountMicros: bigint }
  | {
      error: string;
      status: 402 | 500;
      required?: string;
      available?: string;
      smart_wallet?: string;
    };

const getUsdcForChunkUpload = async (
  artistAddress: string,
  totalSizeBytes: number
): Promise<UsdcForChunkUpload> => {
  const usdcAmountMicros = await getUsdcPriceForBytes(totalSizeBytes);

  let smartWalletAddress: Address;
  try {
    smartWalletAddress = await getSmartWalletAddress(artistAddress as Address);
  } catch {
    return { error: 'Failed to resolve smart wallet', status: 500 };
  }

  const usdcBalance = await getSmartWalletUsdcBalance(smartWalletAddress);
  const requiredMicroUsdc = usdcAmountMicros;

  if (usdcBalance < requiredMicroUsdc) {
    const addr = smartWalletAddress.toLowerCase();
    return {
      error: `Insufficient USDC balance in smart wallet ${addr}`,
      status: 402,
      required: requiredMicroUsdc.toString(),
      available: usdcBalance.toString(),
      smart_wallet: addr,
    };
  }

  return { usdcAmountMicros };
};

export default getUsdcForChunkUpload;
