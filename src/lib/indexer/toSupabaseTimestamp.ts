const toSupabaseTimestamp = (blockTimestamp: number): string => {
  return new Date(blockTimestamp * 1000).toISOString();
};

export default toSupabaseTimestamp;
