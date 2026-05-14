const tortoiseMinterAbi = [
  {
    type: 'function',
    name: 'getTortoiseMinterConfig',
    inputs: [],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'tortoiseShell', type: 'address' },
          { name: 'platformFee', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const;

export default tortoiseMinterAbi;
