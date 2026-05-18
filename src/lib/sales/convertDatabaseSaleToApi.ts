import { Address, zeroAddress } from 'viem';
import { MomentType, MomentSaleConfig } from '@/types/moment';
import { DatabaseSale } from '@/types/sale';

export const convertDatabaseSaleToApi = (
  sale: DatabaseSale
): MomentSaleConfig => ({
  pricePerToken: sale.price_per_token.toString(),
  saleStart: String(sale.sale_start),
  saleEnd: String(sale.sale_end),
  maxTokensPerAddress: String(sale.max_tokens_per_address),
  fundsRecipient: sale.funds_recipient as Address,
  type:
    sale.currency.toLowerCase() === zeroAddress.toLowerCase()
      ? MomentType.FixedPriceMint
      : MomentType.Erc20Mint,
});
