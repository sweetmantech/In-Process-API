import { MomentSaleConfig } from '@/types/moment';
import { OnChainSaleConfig } from '@/types/sale';

export const convertOnChainSaleToApi = (
  sale: OnChainSaleConfig
): MomentSaleConfig => ({
  pricePerToken: sale.pricePerToken.toString(),
  saleStart: sale.saleStart.toString(),
  saleEnd: sale.saleEnd.toString(),
  maxTokensPerAddress: sale.maxTokensPerAddress.toString(),
  fundsRecipient: sale.fundsRecipient,
  type: sale.type,
});
