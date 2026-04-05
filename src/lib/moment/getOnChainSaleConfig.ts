import { Moment, MomentSaleConfig } from '@/types/moment';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';
import { convertOnChainSaleToApi } from '@/lib/sales/convertOnChainSaleToApi';

const getOnChainSaleConfig = async (
  moment: Moment
): Promise<MomentSaleConfig> => {
  const { saleConfig } = await getInProcessMomentInfo(moment);
  return convertOnChainSaleToApi(saleConfig);
};

export default getOnChainSaleConfig;
