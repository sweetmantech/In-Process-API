import { Moment, MomentAdvancedInfo } from '@/types/moment';
import selectSale from '@/lib/supabase/in_process_sales/selectSale';
import { convertDatabaseSaleToApi } from '@/lib/sales/convertDatabaseSaleToApi';
import getOnChainSaleConfig from '@/lib/moment/getOnChainSaleConfig';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';

type DbMoment = NonNullable<
  Awaited<ReturnType<typeof selectMoments>>['data']
>[number];

const resolveMomentFromDb = async (
  moment: Moment,
  dbMoment: DbMoment
): Promise<MomentAdvancedInfo> => {
  const protocol = dbMoment.collection.protocol;
  const isInProcess = protocol === 'in_process';

  let saleConfig = null;
  if (isInProcess) {
    const sale = await selectSale(dbMoment.id);
    saleConfig = sale
      ? convertDatabaseSaleToApi(sale)
      : await getOnChainSaleConfig(moment);
  }

  return {
    id: dbMoment.id,
    uri: dbMoment.uri,
    contentUri: null,
    owner: dbMoment.collection.creator,
    saleConfig,
  };
};

export default resolveMomentFromDb;
