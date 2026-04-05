const soundMetadataAbi = [
  {
    name: 'baseURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'edition', type: 'address' },
      { name: 'tier', type: 'uint8' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

export default soundMetadataAbi;
