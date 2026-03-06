const cr1155Abi = [
  {
    name: 'tokenPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'purchaseTokenWithValue',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_tokenid', type: 'uint256' },
      { name: '_amount', type: 'uint256' },
      { name: '_value', type: 'uint256' },
      { name: '_ref0', type: 'address' },
      { name: '_ref1', type: 'address' },
    ],
    outputs: [],
  },
] as const;

export default cr1155Abi;
