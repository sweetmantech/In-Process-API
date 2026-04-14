import transfersQuerySchema from '@/lib/schema/transfersQuerySchema';
import { Transfer_Type } from '@/types/transfer';
import type { z } from 'zod';
import selectAirdrops from '@/lib/supabase/in_process_transfers/selectAirdrops';
import selectPayments from '@/lib/supabase/in_process_transfers/selectPayments';
import selectTransfers from '@/lib/supabase/in_process_transfers/selectTransfers';

type TransfersParams = z.infer<typeof transfersQuerySchema>;

const getTransfers = async (params: TransfersParams) => {
  const { type, ...rest } = params;
  if (type === Transfer_Type.airdrop) return selectAirdrops(rest);
  if (type === Transfer_Type.payment) return selectPayments(rest);
  return selectTransfers(rest);
};

export default getTransfers;
