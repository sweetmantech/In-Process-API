import { mapPaymentsToSupabase } from './mapPaymentsToSupabase';
import { upsertPayments } from '@/lib/supabase/in_process_payments/upsertPayments';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';
import type { Payments_t } from '@/types/envio';
import { BATCH_SIZE } from '@/lib/consts';
import { distribute } from './distribute';

export async function processPaymentsInBatches(
  deposits: Payments_t[]
): Promise<void> {
  if (!deposits.length) {
    console.log('ℹ️  No payments to process');
    return;
  }

  const totalBatches = Math.ceil(deposits.length / BATCH_SIZE);
  let totalProcessed = 0;

  console.log(
    `🔄 Processing ${deposits.length} payment(s) in ${totalBatches} batch(es)`
  );

  for (let i = 0; i < deposits.length; i += BATCH_SIZE) {
    const batch = deposits.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      await distribute(batch);
      const mappedPayments = await mapPaymentsToSupabase(batch);

      if (mappedPayments.length > 0) {
        await ensureArtists(mappedPayments.map((p) => p.buyer as string));
        await upsertPayments(mappedPayments);
        totalProcessed += mappedPayments.length;
        console.log(
          `✅ Batch ${batchNumber}: Processed ${mappedPayments.length} payment(s)`
        );
      }
    } catch (error) {
      console.error(
        `❌ Batch ${batchNumber}: Error processing batch:`,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  console.log(
    `✅ Completed processing: ${totalProcessed}/${deposits.length} payment(s) indexed`
  );
}
