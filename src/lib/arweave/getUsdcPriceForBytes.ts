import { TurboFactory } from '@ardrive/turbo-sdk/node';

const unauthTurbo = TurboFactory.unauthenticated({ token: 'base-usdc' });

const PRICE_BUFFER = 1.1;

// Returns the USDC amount (whole units, e.g. 0.05) needed to upload byteCount bytes,
// with a 10% buffer for price fluctuations between quote and settlement.
const getUsdcPriceForBytes = async (byteCount: number): Promise<number> => {
  const { tokenPrice } = await unauthTurbo.getTokenPriceForBytes({ byteCount });
  const microUsdc = Math.ceil(Number(tokenPrice) * PRICE_BUFFER);
  return microUsdc / 1_000_000;
};

export default getUsdcPriceForBytes;
