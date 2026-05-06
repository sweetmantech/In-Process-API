import type { EthereumWalletAdapter } from '@ardrive/turbo-sdk/node';
import type { Hex } from 'viem';
import {
  sendUserOperation,
  type SendUserOperationParams,
} from '@/lib/coinbase/sendUserOperation';
import type { EvmSmartAccount } from '@coinbase/cdp-sdk';

const createTurboWalletAdapter = (
  smartAccount: EvmSmartAccount
): EthereumWalletAdapter => ({
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
        network: 'base',
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
});

export default createTurboWalletAdapter;
