import { TurboFactory } from '@ardrive/turbo-sdk/node';
import type {
  TurboCryptoFundResponse,
  TurboSubmitFundTxResponse,
} from '@ardrive/turbo-sdk/node';
import turboClient from './turboClient';
import createTurboWalletAdapter from './createTurboWalletAdapter';
import { getArtistSmartAccount } from '../coinbase/getArtistSmartAccount';

const topUpTurboCredits = async (
  artistId: string,
  usdcAmountMicros: bigint
): Promise<TurboCryptoFundResponse | TurboSubmitFundTxResponse> => {
  try {
    const [smartAccount, ourArweaveAddress] = await Promise.all([
      getArtistSmartAccount({ artistId }),
      turboClient.signer.getNativeAddress(),
    ]);

    const walletAdapter = createTurboWalletAdapter(smartAccount);

    const payerTurbo = TurboFactory.authenticated({
      walletAdapter,
      token: 'base-usdc',
    });

    try {
      return await payerTurbo.topUpWithTokens({
        tokenAmount: usdcAmountMicros.toString(),
        turboCreditDestinationAddress: ourArweaveAddress,
      });
    } catch (fundError: unknown) {
      const message =
        fundError instanceof Error ? fundError.message : String(fundError);
      const txIdMatch = message.match(
        /submitFundTransaction\(id\)':\s*(0x[0-9a-fA-F]+)/
      );
      if (txIdMatch) {
        const txId = txIdMatch[1];
        console.warn(
          `⚠️ topUpWithTokens Phase 2 failed, retrying submitFundTransaction for ${txId}`
        );
        return await payerTurbo.submitFundTransaction({ txId });
      }
      throw fundError;
    }
  } catch (error) {
    console.error(`❌ topUpTurboCredits: ${error}`);
    throw new Error(`❌ topUpTurboCredits: ${error}`);
  }
};

export default topUpTurboCredits;
