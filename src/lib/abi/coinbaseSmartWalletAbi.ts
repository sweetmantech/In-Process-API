const coinbaseSmartWalletAbi = [
  {
    name: 'nextOwnerIndex',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'ownerAtIndex',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [{ type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default coinbaseSmartWalletAbi;
