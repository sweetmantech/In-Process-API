import blockTsToISOString from '@/lib/blockTsToISOString';
import type { Primary_Sales_t } from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';
import { getFeeRecipientsForSale } from './getFeeRecipientsForSale';
import { mapSaleToSupabaseRow } from './mapSaleToSupabaseRow';

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
      mappedSales.push(
        mapSaleToSupabaseRow({
          momentId,
          currency: sale.currency,
          fundsRecipient: sale.funds_recipient,
          maxTokensPerAddress: sale.max_tokens_per_address,
          pricePerToken: sale.price_per_token,
          saleEnd: sale.sale_end,
          saleStart: sale.sale_start,
          createdAt: blockTsToISOString(sale.created_at),
        })
      );
      const feeRecipients = await getFeeRecipientsForSale(sale, momentId);
      mappedFeeRecipients.push(...feeRecipients);
    }
  }

  return { sales: mappedSales, feeRecipients: mappedFeeRecipients };
}
