import { describe, it, expect } from 'vitest';
import { mapSaleToSupabaseRow } from '../mapSaleToSupabaseRow';

describe('mapSaleToSupabaseRow', () => {
  const base = {
    momentId: 'moment-uuid',
    currency: '0xUSDC',
    fundsRecipient: '0xFUNDS',
    pricePerToken: '1000000',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  it('lowercases fundsRecipient and converts numeric fields', () => {
    expect(
      mapSaleToSupabaseRow({
        ...base,
        maxTokensPerAddress: '5',
        saleEnd: '2000',
        saleStart: '1000',
      })
    ).toEqual({
      moment: 'moment-uuid',
      currency: '0xUSDC',
      funds_recipient: '0xfunds',
      max_tokens_per_address: 5,
      price_per_token: 1000000,
      sale_end: 2000,
      sale_start: 1000,
      created_at: '2024-01-01T00:00:00.000Z',
    });
  });

  it('defaults null optional numeric fields to 0', () => {
    const row = mapSaleToSupabaseRow({
      ...base,
      maxTokensPerAddress: null,
      saleEnd: null,
      saleStart: null,
    });
    expect(row.max_tokens_per_address).toBe(0);
    expect(row.sale_end).toBe(0);
    expect(row.sale_start).toBe(0);
  });

  it('accepts bigint values from on-chain sales', () => {
    const row = mapSaleToSupabaseRow({
      ...base,
      fundsRecipient: '0x000000000000000000000000000000000000bEEF',
      maxTokensPerAddress: BigInt(0),
      pricePerToken: BigInt(500),
      saleEnd: BigInt(9999999),
      saleStart: BigInt(1000),
    });
    expect(row.funds_recipient).toBe(
      '0x000000000000000000000000000000000000beef'
    );
    expect(row.price_per_token).toBe(500);
    expect(row.sale_start).toBe(1000);
    expect(row.sale_end).toBe(9999999);
  });
});
