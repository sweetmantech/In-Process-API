import { TurboFactory } from '@ardrive/turbo-sdk/node';
import type {
  EthereumWalletAdapter,
  TurboCryptoFundResponse,
} from '@ardrive/turbo-sdk/node';
import type { Address, Hex } from 'viem';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import turboClient from './turboClient';

const topUpTurboCredits = async (
  artistAddress: Address,
  usdcAmountMicros: bigint
): Promise<TurboCryptoFundResponse> => {
  try {
    const [smartAccount, ourArweaveAddress] = await Promise.all([
      getOrCreateSmartWallet({ address: artistAddress }),
      turboClient.signer.getNativeAddress(),
    ]);

    const network = 'base';

    const walletAdapter: EthereumWalletAdapter = {
      getSigner: () => ({
        signMessage: async (message: string | Uint8Array): Promise<string> => {
          const owner = smartAccount.owners[0];
          return owner.signMessage({
            message:
              typeof message === 'string'
                ? message
                : { raw: Buffer.from(message) as unknown as Hex },
          });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sendTransaction: async ({ to, value, data }: any): Promise<any> => {
          const receipt = await sendUserOperation({
            smartAccount,
            network,
            calls: [
              {
                to: to as `0x${string}`,
                value: (value ?? BigInt(0)) as bigint,
                data: (data ?? '0x') as `0x${string}`,
              },
            ],
          });
          return { hash: receipt.transactionHash };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: null as any,
      }),
    };

    const payerTurbo = TurboFactory.authenticated({
      walletAdapter,
      token: 'base-usdc',
    });

    return payerTurbo.topUpWithTokens({
      tokenAmount: usdcAmountMicros.toString(),
      turboCreditDestinationAddress: ourArweaveAddress,
    });
  } catch (error) {
    console.error(`❌ topUpTurboCredits: ${error}`);
    throw new Error(`❌ topUpTurboCredits: ${error}`);
  }
};

export default topUpTurboCredits;
