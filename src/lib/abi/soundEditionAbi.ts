const soundEditionAbi = [
  {
    name: 'setBaseURI',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'uri', type: 'string' }],
    outputs: [],
  },
  {
    name: 'setContractURI',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'uri', type: 'string' }],
    outputs: [],
  },
] as const;

export default soundEditionAbi;
