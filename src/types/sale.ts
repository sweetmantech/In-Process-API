import { Address } from 'viem';
import { MomentType } from '@/types/moment';
import { Database } from '@/lib/supabase/types';

export type OnChainSaleConfig = {
  pricePerToken: bigint;
  saleStart: bigint;
  saleEnd: bigint;
  maxTokensPerAddress: bigint;
  fundsRecipient: Address;
  type: MomentType;
};

export type DatabaseSale =
  Database['public']['Tables']['in_process_sales']['Row'];

export type FixedPriceSaleConfig = {
  saleStart: bigint;
  saleEnd: bigint;
  maxTokensPerAddress: bigint;
  pricePerToken: bigint;
  fundsRecipient: Address;
};

export type Erc20SaleConfig = FixedPriceSaleConfig & { currency: Address };

export type SaleConfig = FixedPriceSaleConfig | Erc20SaleConfig;

export interface Sale {
  pricePerToken: string;
  saleStart: number;
  saleEnd: number;
  maxTokensPerAddress: number;
  fundsRecipient: Address;
  type: 'erc20Mint' | 'timed' | 'fixedPrice';
}
