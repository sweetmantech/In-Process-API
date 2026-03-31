import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/supabase/in_process_payments/selectPayments', () => ({
  selectPayments: vi.fn(),
}));
vi.mock('@/lib/smartwallets/getSmartWalletAddress', () => ({
  default: vi.fn(),
}));

import { selectPayments } from '@/lib/supabase/in_process_payments/selectPayments';
import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';
import getPaymentsHandler from '@/lib/payments/getPaymentsHandler';

const BASE_PARAMS = {
  limit: 20,
  page: 1,
  artist: undefined as string | undefined,
  collector: undefined as string | undefined,
  chainId: undefined as number | undefined,
  mime: undefined as string | undefined,
};

const MOCK_PAYMENTS = [{ id: '1', amount: '1000' }];

describe('getPaymentsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSmartWalletAddress).mockResolvedValue('0xsmartWallet' as any);
  });

  describe('success', () => {
    it('returns payments and pagination on success', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: MOCK_PAYMENTS as any,
        count: 1,
        error: null,
      });

      const res = await getPaymentsHandler(BASE_PARAMS);
      const json = await res.json();

      expect(res).toBeInstanceOf(NextResponse);
      expect(json.status).toBe('success');
      expect(json.payments).toEqual(MOCK_PAYMENTS);
      expect(json.pagination).toEqual({
        total_count: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      });
    });

    it('returns empty array when data is null', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: null as any,
        count: 0,
        error: null,
      });

      const res = await getPaymentsHandler(BASE_PARAMS);
      const json = await res.json();

      expect(json.status).toBe('success');
      expect(json.payments).toEqual([]);
    });

    it('calculates total_pages correctly', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: MOCK_PAYMENTS as any,
        count: 45,
        error: null,
      });

      const res = await getPaymentsHandler({ ...BASE_PARAMS, limit: 20 });
      const json = await res.json();

      expect(json.pagination.total_pages).toBe(3);
    });
  });

  describe('error handling', () => {
    it('returns 500 on DB error', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: null,
        count: null,
        error: new Error('DB error'),
      });

      const res = await getPaymentsHandler(BASE_PARAMS);

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.status).toBe('error');
      expect(json.message).toBe('DB error');
    });
  });

  describe('artist filtering', () => {
    it('resolves smart wallet and passes both addresses for artist', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: [] as any,
        count: 0,
        error: null,
      });

      await getPaymentsHandler({ ...BASE_PARAMS, artist: '0xartist' });

      expect(getSmartWalletAddress).toHaveBeenCalledWith('0xartist');
      expect(selectPayments).toHaveBeenCalledWith(
        expect.objectContaining({
          artists: ['0xsmartWallet', '0xartist'],
        })
      );
    });

    it('passes empty artists array when no artist provided', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: [] as any,
        count: 0,
        error: null,
      });

      await getPaymentsHandler(BASE_PARAMS);

      expect(selectPayments).toHaveBeenCalledWith(
        expect.objectContaining({ artists: [] })
      );
    });
  });

  describe('collector filtering', () => {
    it('resolves smart wallet and passes both addresses for collector', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: [] as any,
        count: 0,
        error: null,
      });

      await getPaymentsHandler({ ...BASE_PARAMS, collector: '0xcollector' });

      expect(getSmartWalletAddress).toHaveBeenCalledWith('0xcollector');
      expect(selectPayments).toHaveBeenCalledWith(
        expect.objectContaining({
          collectors: ['0xsmartWallet', '0xcollector'],
        })
      );
    });

    it('passes empty collectors array when no collector provided', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: [] as any,
        count: 0,
        error: null,
      });

      await getPaymentsHandler(BASE_PARAMS);

      expect(selectPayments).toHaveBeenCalledWith(
        expect.objectContaining({ collectors: [] })
      );
    });
  });

  describe('mime filtering', () => {
    it('passes mime to selectPayments', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: [] as any,
        count: 0,
        error: null,
      });

      await getPaymentsHandler({ ...BASE_PARAMS, mime: 'audio/%' });

      expect(selectPayments).toHaveBeenCalledWith(
        expect.objectContaining({ mime: 'audio/%' })
      );
    });

    it('passes undefined mime when not provided', async () => {
      vi.mocked(selectPayments).mockResolvedValue({
        data: [] as any,
        count: 0,
        error: null,
      });

      await getPaymentsHandler(BASE_PARAMS);

      expect(selectPayments).toHaveBeenCalledWith(
        expect.objectContaining({ mime: undefined })
      );
    });
  });
});
