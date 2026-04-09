const parseFidFromResources = (
  resources: readonly string[] | undefined
): bigint | null => {
  if (!resources) return null;
  for (const resource of resources) {
    const match = resource.match(/^farcaster:\/\/fid\/(\d+)$/);
    if (match) return BigInt(match[1]);
  }
  return null;
};

export default parseFidFromResources;
