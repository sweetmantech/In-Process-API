import { parseUnits } from 'viem';
import { unauthTurboClient } from './turboClient';

// Buffer = 1.1 — ceil(micros * 11 / 10)
const BUFFER_NUM = BigInt(11);
const BUFFER_DEN = BigInt(10);

// Returns USDC in micros (1e-6 units) for byteCount, with a 10% buffer for
// price fluctuations between quote and settlement.
const getUsdcPriceForBytes = async (byteCount: number): Promise<bigint> => {
  const { tokenPrice } = await unauthTurboClient.getTokenPriceForBytes({
    byteCount,
  });
  const baseMicros = parseUnits(tokenPrice, 6);
  return (baseMicros * BUFFER_NUM + BUFFER_DEN - BigInt(1)) / BUFFER_DEN;
};

export default getUsdcPriceForBytes;
