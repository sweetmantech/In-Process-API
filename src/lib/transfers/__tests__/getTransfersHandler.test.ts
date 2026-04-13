import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Transfer_Type } from '@/types/transfer';

vi.mock('@/lib/transfers/selectTransfers', () => ({
  default: vi.fn(),
}));

import selectTransfers from '@/lib/transfers/selectTransfers';
import getTransfersHandler from '@/lib/transfers/getTransfersHandler';

const BASE_PARAMS = {
  chainId: 8453,
  limit: 20,
  page: 1,
  type: undefined as Transfer_Type | undefined,
  artist: undefined as string | undefined,
  collector: undefined as string | undefined,
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

    it('keeps fee_recipients inside moment payload', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({
        data: [
          {
            id: '1',
            moment: {
              token_id: 1,
              fee_recipients: [
                {
                  artist_address: '0x71ea0189673968499be6386f8febf37a7d3dacdc',
                  percent_allocation: 100,
                },
              ],
            },
          },
        ] as any,
        count: 1,
      });

      const res = await getTransfersHandler(BASE_PARAMS);
      const json = await res.json();

      expect(json.transfers[0].moment.fee_recipients).toEqual([
        {
          artist_address: '0x71ea0189673968499be6386f8febf37a7d3dacdc',
          percent_allocation: 100,
        },
      ]);
      expect(json.transfers[0].moment.token_id).toBe(1);
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

    it('passes artist filter', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({ data: [], count: 0 });

      await getTransfersHandler({
        ...BASE_PARAMS,
        artist: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      });

      expect(selectTransfers).toHaveBeenCalledWith(
        expect.objectContaining({
          artist: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        })
      );
    });

    it('passes collector filter', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({ data: [], count: 0 });

      await getTransfersHandler({
        ...BASE_PARAMS,
        collector: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      });

      expect(selectTransfers).toHaveBeenCalledWith(
        expect.objectContaining({
          collector: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        })
      );
    });

    it('passes type=airdrop filter', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({ data: [], count: 0 });

      await getTransfersHandler({
        ...BASE_PARAMS,
        type: Transfer_Type.airdrop,
      });

      expect(selectTransfers).toHaveBeenCalledWith(
        expect.objectContaining({ type: Transfer_Type.airdrop })
      );
    });

    it('passes type=payment filter', async () => {
      vi.mocked(selectTransfers).mockResolvedValue({ data: [], count: 0 });

      await getTransfersHandler({
        ...BASE_PARAMS,
        type: Transfer_Type.payment,
      });

      expect(selectTransfers).toHaveBeenCalledWith(
        expect.objectContaining({ type: Transfer_Type.payment })
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
