import transfersQuerySchema from '@/lib/schema/transfersQuerySchema';
import { Transfer_Type } from '@/types/transfer';
import type { z } from 'zod';
import selectAirdrops from '@/lib/supabase/in_process_transfers/selectAirdrops';
import selectPayments from '@/lib/supabase/in_process_transfers/selectPayments';

type TransfersParams = z.infer<typeof transfersQuerySchema>;

const selectTransfers = async (params: TransfersParams) => {
  const { type, ...rest } = params;
  if (type === Transfer_Type.airdrop) return selectAirdrops(rest);
  return selectPayments(rest);
};

export default selectTransfers;
