import { Hex } from 'viem';
import cdp from '@/lib/coinbase/client';
import getCdpPaymasterUrl from '@/lib/coinbase/getCdpPaymasterUrl';

export interface EvmCall {
  to: `0x${string}`;
  value: bigint;
  data: Hex;
  overrideGasLimit?: string;
}

export async function prepareUserOperation({
  smartAccount,
  network,
  calls,
}: {
  smartAccount: any;
  network: 'base-sepolia' | 'base';
  calls: EvmCall[];
}) {
  return cdp.evm.prepareUserOperation({
    smartAccount,
    network,
    paymasterUrl: getCdpPaymasterUrl(network),
    calls: calls as any,
  });
}
