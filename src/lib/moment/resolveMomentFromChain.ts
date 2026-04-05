import { Moment, MomentAdvancedInfo } from '@/types/moment';
import isCatalogContract from '@/lib/viem/isCatalogContract';
import isSoundContract from '@/lib/viem/isSoundContract';
import getCatalogInfo from '@/lib/viem/getCatalogInfo';
import getSoundInfo from '@/lib/viem/getSoundInfo';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';
import { convertOnChainSaleToApi } from '@/lib/sales/convertOnChainSaleToApi';

const resolveMomentFromChain = async (
  moment: Moment
): Promise<MomentAdvancedInfo> => {
  const [isCatalog, isSound] = await Promise.all([
    isCatalogContract(moment.collectionAddress, moment.chainId),
    isSoundContract(moment.collectionAddress, moment.chainId),
  ]);

  if (isCatalog) {
    const { owner, tokenUri } = await getCatalogInfo(moment);
    return {
      id: null,
      uri: tokenUri,
      owner,
      saleConfig: null,
    };
  }

  if (isSound) {
    const { owner, tokenUri } = await getSoundInfo(moment);
    return {
      id: null,
      uri: tokenUri,
      owner,
      saleConfig: null,
    };
  }

  const { saleConfig, owner, tokenUri } = await getInProcessMomentInfo(moment);
  return {
    id: null,
    uri: tokenUri,
    owner,
    saleConfig: convertOnChainSaleToApi(saleConfig),
  };
};

export default resolveMomentFromChain;
