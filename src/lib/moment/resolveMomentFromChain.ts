import { Moment, MomentAdvancedInfo } from '@/types/moment';
import isCatalogContract from '@/lib/viem/isCatalogContract';
import getCatalogInfo from '@/lib/viem/getCatalogInfo';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';
import { convertOnChainSaleToApi } from '@/lib/sales/convertOnChainSaleToApi';

const resolveMomentFromChain = async (
  moment: Moment
): Promise<MomentAdvancedInfo> => {
  const isCatalog = await isCatalogContract(
    moment.collectionAddress,
    moment.chainId
  );

  if (isCatalog) {
    const { saleConfig, tokenUri } = await getCatalogInfo(moment);
    return {
      id: null,
      uri: tokenUri,
      owner: moment.collectionAddress,
      saleConfig,
    };
  }

  const { saleConfig, owner, tokenUri } = await getInProcessMomentInfo(moment);
  return {
    id: null,
    uri: tokenUri,
    owner: owner as string,
    saleConfig: convertOnChainSaleToApi(saleConfig),
  };
};

export default resolveMomentFromChain;
