import type { Primary_Sales_t } from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { mapSalesToSupabase } from './mapSalesToSupabase';
import { upsertSales } from '@/lib/supabase/in_process_sales/upsertSales';
import { upsertFeeRecipients } from '@/lib/supabase/in_process_moment_fee_recipients/upsertFeeRecipients';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';

export async function processSalesInBatches(
  sales: Primary_Sales_t[]
): Promise<void> {
  let totalProcessed = 0;

  for (let i = 0; i < sales.length; i += BATCH_SIZE) {
    try {
      const batch = sales.slice(i, i + BATCH_SIZE);
      const { sales: mappedSales, feeRecipients: mappedFeeRecipients } =
        await mapSalesToSupabase(batch);

      await ensureArtists([
        ...new Set(mappedFeeRecipients.map((fr) => fr.artist_address)),
      ]);
      await upsertSales(mappedSales);
      await upsertFeeRecipients(mappedFeeRecipients);

      totalProcessed += mappedSales.length;
      console.log(
        `💰 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processed ${mappedSales.length} sales`
      );
    } catch (error) {
      console.error(
        `❌ Failed to process batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error
      );
    }
  }

  if (totalProcessed > 0)
    console.log(`✅  Completed processing: ${totalProcessed} sales`);
  else console.log(`ℹ️  No sales to process`);
}
