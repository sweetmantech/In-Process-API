import { unauthTurboClient } from './turboClient';

const getWincCostForBytes = async (sizeBytes: number): Promise<string> => {
  const [result] = await unauthTurboClient.getUploadCosts({
    bytes: [sizeBytes],
  });
  return result.winc;
};

export default getWincCostForBytes;
