import type { Database } from '@/lib/supabase/types';

export type SaleToSupabaseRowInput = {
  momentId: string;
  currency: string;
  fundsRecipient: string;
  maxTokensPerAddress?: string | number | bigint | null;
  pricePerToken: string | number | bigint;
  saleEnd?: string | number | bigint | null;
  saleStart?: string | number | bigint | null;
  createdAt: string;
};

export const mapSaleToSupabaseRow = ({
  momentId,
  currency,
  fundsRecipient,
  maxTokensPerAddress,
  pricePerToken,
  saleEnd,
  saleStart,
  createdAt,
}: SaleToSupabaseRowInput): Database['public']['Tables']['in_process_sales']['Insert'] => ({
  moment: momentId,
  currency,
  funds_recipient: fundsRecipient.toLowerCase(),
  max_tokens_per_address: Number(maxTokensPerAddress ?? 0),
  price_per_token: Number(pricePerToken),
  sale_end: Number(saleEnd ?? 0),
  sale_start: Number(saleStart ?? 0),
  created_at: createdAt,
});
