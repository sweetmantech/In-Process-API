import { SplitRecipient } from '@0xsplits/splits-sdk';
import { Address, getAddress } from 'viem';
import resolveEnsToAddress from '@/lib/ens/resolveEnsToAddress';

/**
 * Converts split recipients with ENS names or raw addresses into checksum-address recipients.
 * Throws an error if any ENS name fails to resolve.
 */
export const normalizeSplitRecipients = async (
  splits: SplitRecipient[]
): Promise<SplitRecipient[]> => {
  return Promise.all(
    splits.map(async (split) => {
      let address: Address;

      if (split.address.startsWith('0x')) {
        address = getAddress(split.address);
      } else {
        const resolved = await resolveEnsToAddress(split.address);
        if (!resolved) {
          throw new Error(`Failed to resolve ENS name: ${split.address}`);
        }
        address = getAddress(resolved);
      }

      return {
        address: address as string,
        percentAllocation: split.percentAllocation,
      };
    })
  );
};
