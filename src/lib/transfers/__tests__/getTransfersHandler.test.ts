import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_transfers/selectTransfers', () => ({
  default: vi.fn(),
}));

import selectTransfers from '@/lib/supabase/in_process_transfers/selectTransfers';
import getTransfersHandler from '@/lib/transfers/getTransfersHandler';

const BASE_PARAMS = {
  chainId: 8453,
  limit: 20,
  page: 1,
  type: undefined as 'airdrop' | undefined,
  spender: undefined as string | undefined,
  recipient: undefined as string | undefined,
};

const MOCK_TRANSFERS = [
  { id: '1', transferred_at: '2024-01-01T00:00:00Z' },
  { id: '2', transferred_at: '2024-01-02T00:00:00Z' },
];

describe('getTransfersHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful responses', () => {
    it('returns transfers and pagination', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({
        data: MOCK_TRANSFERS as any,
        count: 2,
      });

      const res = await getTransfersHandler(BASE_PARAMS);
      const json = await res.json();

      expect(json.transfers).toEqual(MOCK_TRANSFERS);
      expect(json.pagination.total_count).toBe(2);
      expect(json.pagination.page).toBe(1);
      expect(json.pagination.limit).toBe(20);
      expect(json.pagination.total_pages).toBe(1);
    });

    it('returns empty transfers array when data is null', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({
        data: null,
        count: 0,
      });

      const res = await getTransfersHandler(BASE_PARAMS);
      const json = await res.json();

      expect(json.transfers).toEqual([]);
    });

    it('uses 0 for total_count when count is null', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({
        data: [],
        count: null,
      });

      const res = await getTransfersHandler(BASE_PARAMS);
      const json = await res.json();

      expect(json.pagination.total_count).toBe(0);
    });

    it('calculates total_pages correctly', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({
        data: MOCK_TRANSFERS as any,
        count: 45,
      });

      const res = await getTransfersHandler({ ...BASE_PARAMS, limit: 20 });
      const json = await res.json();

      expect(json.pagination.total_pages).toBe(3);
    });

    it('returns total_pages of 0 when total_count is 0', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({
        data: [],
        count: 0,
      });

      const res = await getTransfersHandler(BASE_PARAMS);
      const json = await res.json();

      expect(json.pagination.total_pages).toBe(0);
    });
  });

  describe('passes params to selectTransfers', () => {
    it('passes all base params', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({ data: [], count: 0 });

      await getTransfersHandler(BASE_PARAMS);

      expect(selectTransfers).toHaveBeenCalledWith(
        expect.objectContaining({
          chainId: 8453,
          limit: 20,
          page: 1,
        })
      );
    });

    it('passes spender filter', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({ data: [], count: 0 });

      await getTransfersHandler({
        ...BASE_PARAMS,
        spender: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      });

      expect(selectTransfers).toHaveBeenCalledWith(
        expect.objectContaining({
          spender: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        })
      );
    });

    it('passes recipient filter', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({ data: [], count: 0 });

      await getTransfersHandler({
        ...BASE_PARAMS,
        recipient: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      });

      expect(selectTransfers).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        })
      );
    });

    it('passes type=airdrop filter', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({ data: [], count: 0 });

      await getTransfersHandler({ ...BASE_PARAMS, type: 'airdrop' });

      expect(selectTransfers).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'airdrop' })
      );
    });
  });

  describe('error handling', () => {
    it('throws when selectTransfers throws', async () => {
      vi.mocked(selectTransfers).mockRejectedValue(new Error('DB failure'));

      await expect(getTransfersHandler(BASE_PARAMS)).rejects.toThrow(
        'DB failure'
      );
    });
  });
});
