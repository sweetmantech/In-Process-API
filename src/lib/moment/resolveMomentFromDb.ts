import { Moment, MomentAdvancedInfo } from '@/types/moment';
import selectSale from '@/lib/supabase/in_process_sales/selectSale';
import { convertDatabaseSaleToApi } from '@/lib/sales/convertDatabaseSaleToApi';
import { convertOnChainSaleToApi } from '@/lib/sales/convertOnChainSaleToApi';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';
import getInProcessSoldOut from '@/lib/viem/getInProcessSoldOut';
import selectMoments, {
  type MomentWithCollection,
} from '@/lib/supabase/in_process_moments/selectMoments';

type DbMoment = MomentWithCollection;

const resolveMomentFromDb = async (
  moment: Moment,
  dbMoment: DbMoment
): Promise<MomentAdvancedInfo> => {
  const protocol = dbMoment.collection.protocol;
  const isInProcess = protocol === 'in_process';

  let saleConfig = null;
  let soldOut = false;
  if (isInProcess) {
    const sale = await selectSale(dbMoment.id);
    if (sale) {
      saleConfig = convertDatabaseSaleToApi(sale);
      soldOut = await getInProcessSoldOut(moment);
    } else {
      const info = await getInProcessMomentInfo(moment);
      saleConfig = convertOnChainSaleToApi(info.saleConfig);
      soldOut = info.soldOut;
    }
  }

  return {
    id: dbMoment.id,
    uri: dbMoment.uri,
    contentUri: null,
    owner: dbMoment.collection.creator,
    saleConfig,
    soldOut,
  };
};

export default resolveMomentFromDb;
