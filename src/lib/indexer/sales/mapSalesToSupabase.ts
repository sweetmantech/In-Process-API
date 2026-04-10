import blockTsToISOString from '@/lib/blockTsToISOString';
import type { Primary_Sales_t } from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/indexer/moments/getMomentIdMap';
import { getFeeRecipientsForSale } from './getFeeRecipientsForSale';

export async function mapSalesToSupabase(sales: Primary_Sales_t[]): Promise<{
  sales: Array<Database['public']['Tables']['in_process_sales']['Insert']>;
  feeRecipients: Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  >;
}> {
  const mappedSales: Array<
    Database['public']['Tables']['in_process_sales']['Insert']
  > = [];
  const mappedFeeRecipients: Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  > = [];
  const momentIdMap = await getMomentIdMap(sales);

  for (const sale of sales) {
    const tripletKey = `${sale.collection.toLowerCase()}:${sale.chain_id}:${sale.token_id}`;
    const momentId = momentIdMap.get(tripletKey);
    if (momentId) {
      mappedSales.push({
        moment: momentId,
        currency: sale.currency,
        funds_recipient: sale.funds_recipient.toLowerCase(),
        max_tokens_per_address: Number(sale.max_tokens_per_address ?? 0),
        price_per_token: Number(sale.price_per_token),
        sale_end: Number(sale.sale_end ?? 0),
        sale_start: Number(sale.sale_start ?? 0),
        created_at: blockTsToISOString(sale.created_at),
      });
      const feeRecipients = await getFeeRecipientsForSale(sale, momentId);
      mappedFeeRecipients.push(...feeRecipients);
    }
  }

  return { sales: mappedSales, feeRecipients: mappedFeeRecipients };
}
