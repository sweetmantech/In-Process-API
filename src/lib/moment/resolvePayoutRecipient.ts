import { Address, getAddress } from 'viem';
import { SplitRecipient } from '@0xsplits/splits-sdk';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import { processSplits } from '@/lib/splits/processSplits';

const resolvePayoutRecipient = async ({
  resolvedSplits,
  smartAccount,
  defaultPayoutRecipient,
}: {
  resolvedSplits: SplitRecipient[];
  smartAccount: EvmSmartAccount;
  defaultPayoutRecipient: Address | undefined;
}): Promise<Address | undefined> => {
  if (resolvedSplits.length >= 2) {
    const { splitAddress } = await processSplits(resolvedSplits, smartAccount);
    if (splitAddress) return getAddress(splitAddress);
  }
  return defaultPayoutRecipient;
};

export default resolvePayoutRecipient;
