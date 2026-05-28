import { getWalletLinkedSmartAccount } from '@/lib/coinbase/getWalletLinkedSmartAccount';
import { Address } from 'viem';

const getSmartWalletAddress = async (address: Address): Promise<Address> => {
  const smartAccount = await getWalletLinkedSmartAccount({
    address: address.toLowerCase() as Address,
  });
  return smartAccount.address.toLowerCase() as Address;
};

export default getSmartWalletAddress;
