import getBase64Image from './getBase64Image';

export interface CollageImageEntry {
  url: string;
  createdAt: string;
}

const collectCollageImages = async (
  inputs: { imageUrl: string; createdAt: string }[]
): Promise<CollageImageEntry[]> => {
  if (inputs.length === 0) return [];

  const results = await Promise.all(
    inputs.map(async ({ imageUrl, createdAt }, i) => {
      const url = await getBase64Image(imageUrl);
      return url !== null ? { index: i, url, createdAt } : null;
    })
  );

  return results
    .filter(
      (r): r is { index: number; url: string; createdAt: string } => r !== null
    )
    .sort((a, b) => b.index - a.index)
    .map(({ url, createdAt }) => ({ url, createdAt }));
};

export default collectCollageImages;
