const soundMetadataAbi = [
  {
    name: 'setBaseURI',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'edition', type: 'address' },
      { name: 'tier', type: 'uint8' },
      { name: 'uri', type: 'string' },
    ],
    outputs: [],
  },
] as const;

export default soundMetadataAbi;
