import { TurboFactory } from '@ardrive/turbo-sdk/node';
import { parseUnits } from 'viem';

const unauthTurbo = TurboFactory.unauthenticated({ token: 'base-usdc' });

// Buffer = 1.1 — ceil(micros * 11 / 10)
const BUFFER_NUM = BigInt(11);
const BUFFER_DEN = BigInt(10);

// Returns USDC in micros (1e-6 units) for byteCount, with a 10% buffer for
// price fluctuations between quote and settlement.
const getUsdcPriceForBytes = async (byteCount: number): Promise<bigint> => {
  const { tokenPrice } = await unauthTurbo.getTokenPriceForBytes({ byteCount });
  const baseMicros = parseUnits(tokenPrice, 6);
  return (baseMicros * BUFFER_NUM + BUFFER_DEN - BigInt(1)) / BUFFER_DEN;
};

export default getUsdcPriceForBytes;
