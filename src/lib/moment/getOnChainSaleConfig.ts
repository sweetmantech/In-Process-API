import { Moment, MomentSaleConfig } from '@/types/moment';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';
import getCatalogInfo from '@/lib/viem/getCatalogInfo';
import { convertOnChainSaleToApi } from '@/lib/sales/convertOnChainSaleToApi';

const getOnChainSaleConfig = async (
  moment: Moment,
  protocol: string
): Promise<MomentSaleConfig> => {
  if (protocol === 'catalog') {
    const { saleConfig } = await getCatalogInfo(moment);
    return saleConfig;
  }
  const { saleConfig } = await getInProcessMomentInfo(moment);
  return convertOnChainSaleToApi(saleConfig);
};

export default getOnChainSaleConfig;
