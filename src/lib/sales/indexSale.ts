import type { Moment } from '@/types/moment';
import type { SaleConfig } from '@/types/sale';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import selectSale from '@/lib/supabase/in_process_sales/selectSale';
import { upsertSales } from '@/lib/supabase/in_process_sales/upsertSales';
import { getFeeRecipientsForSale } from '@/lib/sales/getFeeRecipientsForSale';
import { ensureWallets } from '@/lib/wallets/ensureWallets';
import deleteFeeRecipientsByMoment from '@/lib/supabase/in_process_moment_fee_recipients/deleteFeeRecipientsByMoment';
import { upsertFeeRecipients } from '@/lib/supabase/in_process_moment_fee_recipients/upsertFeeRecipients';

const indexSale = async ({
  moment,
  sale,
}: {
  moment: Moment;
  sale: SaleConfig;
}) => {
  const collectionAddress = moment.collectionAddress.toLowerCase();
  const { data: moments } = await selectMoments({
    moments: [moment],
    chainId: moment.chainId,
    limit: 1,
  });
  const dbMoment = moments?.find(
    (row) =>
      row.collection.address.toLowerCase() === collectionAddress &&
      String(row.token_id) === String(moment.tokenId) &&
      row.collection.chain_id === moment.chainId
  );
  if (!dbMoment) return;

  const existing = await selectSale(dbMoment.id);
  if (!existing) return;

  await upsertSales([
    {
      moment: dbMoment.id,
      currency: existing.currency,
      funds_recipient: sale.fundsRecipient.toLowerCase(),
      max_tokens_per_address: Number(sale.maxTokensPerAddress),
      price_per_token: Number(sale.pricePerToken),
      sale_end: Number(sale.saleEnd),
      sale_start: Number(sale.saleStart),
      created_at: existing.created_at,
    },
  ]);

  const feeRecipients = await getFeeRecipientsForSale(
    {
      funds_recipient: sale.fundsRecipient,
      chain_id: moment.chainId,
    },
    dbMoment.id
  );

  await ensureWallets(
    feeRecipients.map((recipient) => recipient.artist_address)
  );
  await deleteFeeRecipientsByMoment(dbMoment.id);
  await upsertFeeRecipients(feeRecipients);
};

export default indexSale;
