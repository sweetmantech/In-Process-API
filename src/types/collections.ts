import { Address, Hash } from 'viem';

export interface UpdateCollectionURIInput {
  collection: {
    address: Address;
    chainId: number;
  };
  newUri: string;
  newCollectionName: string;
  artistAddress: Address;
}

export interface UpdateCollectionURIResult {
  hash: Hash;
  chainId: number;
}

export interface CreateCollectionInput {
  account: Address;
  uri: string;
  name: string;
  splits?: Array<{
    address: string;
    percentAllocation: number;
  }>;
}

export interface CreateCollectionResult {
  contractAddress: Address;
  hash: Hash;
  chainId: number;
}
