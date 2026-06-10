import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import { Address } from 'viem';

const getSmartWalletAddress = async (address: Address): Promise<Address> => {
  const smartAccount = await getWalletSmartAccount({
    address: address.toLowerCase() as Address,
  });
  return smartAccount.address.toLowerCase() as Address;
};

export default getSmartWalletAddress;
