import type { Database } from '@/lib/supabase/types';
import isSplitContract from '@/lib/splits/isSplitContract';
import type { Address } from 'viem';
import getSplitRecipients from '@/lib/splits/getSplitRecipients';
import type { Primary_Sales_t } from '@/types/envio';

export async function getFeeRecipientsForSale(
  sale: Primary_Sales_t,
  momentId: string
): Promise<
  Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  >
> {
  const feeRecipients: Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  > = [];

  const isSplit = await isSplitContract(
    sale.funds_recipient as Address,
    sale.chain_id
  );

  if (isSplit) {
    const recipients = await getSplitRecipients(
      sale.funds_recipient as Address,
      sale.chain_id
    );
    if (recipients) {
      for (const r of recipients) {
        feeRecipients.push({
          moment: momentId,
          artist_address: r.recipient.address.toLowerCase(),
          percent_allocation: Number(r.percentAllocation ?? 0),
        });
      }
    } else {
      console.warn(
        `⚠️  No recipients for split contract ${sale.funds_recipient} on chain ${sale.chain_id}`
      );
    }
  } else {
    feeRecipients.push({
      moment: momentId,
      artist_address: sale.funds_recipient.toLowerCase(),
      percent_allocation: 100,
    });
  }

  return feeRecipients;
}
