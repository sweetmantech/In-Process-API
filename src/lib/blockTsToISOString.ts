const blockTsToISOString = (blockTimestamp: number): string => {
  return new Date(blockTimestamp * 1000).toISOString();
};

export default blockTsToISOString;
