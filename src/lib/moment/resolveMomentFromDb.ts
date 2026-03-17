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
  const sale = await selectSale(dbMoment.id);
  const saleConfig = sale
    ? convertDatabaseSaleToApi(sale)
    : await getOnChainSaleConfig(moment, dbMoment.collection.protocol);

  return {
    id: dbMoment.id,
    uri: dbMoment.uri,
    owner: dbMoment.collection.creator,
    saleConfig,
  };
};

export default resolveMomentFromDb;
