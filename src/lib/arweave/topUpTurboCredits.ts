import { TurboFactory } from '@ardrive/turbo-sdk/node';
import type {
  TurboCryptoFundResponse,
  TurboSubmitFundTxResponse,
} from '@ardrive/turbo-sdk/node';
import type { Address } from 'viem';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import turboClient from './turboClient';
import createTurboWalletAdapter from './createTurboWalletAdapter';

const topUpTurboCredits = async (
  artistAddress: Address,
  usdcAmountMicros: bigint
): Promise<TurboCryptoFundResponse | TurboSubmitFundTxResponse> => {
  try {
    const [smartAccount, ourArweaveAddress] = await Promise.all([
      getOrCreateSmartWallet({ address: artistAddress }),
      turboClient.signer.getNativeAddress(),
    ]);

    const network = 'base';
    const walletAdapter = createTurboWalletAdapter(smartAccount, network);

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
