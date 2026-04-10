import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/grpc/buildQuery', () => ({ buildQuery: vi.fn() }));
vi.mock('@/lib/grpc/queryGrpc', () => ({ queryGrpc: vi.fn() }));
vi.mock('@/lib/indexer/indexers', () => ({ indexers: [] }));
vi.mock('@/lib/consts', () => ({ PAGE_LIMIT: 2 }));
vi.mock('@/lib/msToBlockTs', () => ({
  default: vi.fn((ms) => Math.floor((ms ?? 0) / 1000)),
}));

import { runIndexer } from '../runIndexer';
import { buildQuery } from '@/lib/grpc/buildQuery';
import { queryGrpc } from '@/lib/grpc/queryGrpc';
import { indexers } from '@/lib/indexer/indexers';

const mockBuildQuery = vi.mocked(buildQuery);
const mockQueryGrpc = vi.mocked(queryGrpc);
const mockIndexers = indexers as any[];

const makeIndexer = (name: string, dataPath: string, items: unknown[]) => ({
  indexName: name,
  dataPath,
  processBatchFn: vi.fn().mockResolvedValue(undefined),
  selectMaxTimestampFn: vi.fn().mockResolvedValue(1700000000000),
  queryFragment: `${dataPath}(limit: $limit) { id }`,
});

describe('runIndexer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildQuery.mockReturnValue('query GetAll { }');
    // reset indexers array
    mockIndexers.length = 0;
  });

  it('returns false when there is no data', async () => {
    const indexer = makeIndexer('moments', 'InProcess_Moments', []);
    mockIndexers.push(indexer);
    mockQueryGrpc.mockResolvedValue({ InProcess_Moments: [] });

    const result = await runIndexer({ moments: null });
    expect(result).toBe(false);
    expect(indexer.processBatchFn).not.toHaveBeenCalled();
  });

  it('returns true and processes batch when data is returned', async () => {
    const indexer = makeIndexer('moments', 'InProcess_Moments', []);
    mockIndexers.push(indexer);
    mockQueryGrpc.mockResolvedValue({ InProcess_Moments: [{ id: '1' }] });

    const result = await runIndexer({ moments: null });
    expect(result).toBe(true);
    expect(indexer.processBatchFn).toHaveBeenCalledWith([{ id: '1' }]);
  });

  it('updates cachedTimestamps for indexers that had data', async () => {
    const indexer = makeIndexer('moments', 'InProcess_Moments', []);
    mockIndexers.push(indexer);
    mockQueryGrpc.mockResolvedValue({ InProcess_Moments: [{ id: '1' }] });
    indexer.selectMaxTimestampFn.mockResolvedValue(9999);

    const cached: Record<string, number | null> = { moments: null };
    await runIndexer(cached);

    expect(cached.moments).toBe(9999);
  });

  it('does not update cachedTimestamps for indexers with no data', async () => {
    const indexer = makeIndexer('moments', 'InProcess_Moments', []);
    mockIndexers.push(indexer);
    mockQueryGrpc.mockResolvedValue({ InProcess_Moments: [] });

    const cached: Record<string, number | null> = { moments: 5000 };
    await runIndexer(cached);

    expect(cached.moments).toBe(5000); // unchanged
    expect(indexer.selectMaxTimestampFn).not.toHaveBeenCalled();
  });

  it('paginates when a page is full (entities.length === PAGE_LIMIT)', async () => {
    const indexer = makeIndexer('moments', 'InProcess_Moments', []);
    mockIndexers.push(indexer);

    // First call returns full page (2 items = PAGE_LIMIT), second returns 1 (partial)
    mockQueryGrpc
      .mockResolvedValueOnce({ InProcess_Moments: [{ id: '1' }, { id: '2' }] })
      .mockResolvedValueOnce({ InProcess_Moments: [{ id: '3' }] });

    await runIndexer({ moments: null });

    expect(indexer.processBatchFn).toHaveBeenCalledTimes(2);
    expect(mockQueryGrpc).toHaveBeenCalledTimes(2);
  });

  it('stops paginating when page is not full', async () => {
    const indexer = makeIndexer('moments', 'InProcess_Moments', []);
    mockIndexers.push(indexer);

    // Returns 1 item (less than PAGE_LIMIT=2) — no second page
    mockQueryGrpc.mockResolvedValueOnce({ InProcess_Moments: [{ id: '1' }] });

    await runIndexer({ moments: null });

    expect(mockQueryGrpc).toHaveBeenCalledTimes(1);
  });

  it('handles multiple indexers independently', async () => {
    const momentsIndexer = makeIndexer('moments', 'InProcess_Moments', []);
    const salesIndexer = makeIndexer('sales', 'Primary_Sales', []);
    mockIndexers.push(momentsIndexer, salesIndexer);

    mockQueryGrpc.mockResolvedValue({
      InProcess_Moments: [{ id: 'm1' }],
      Primary_Sales: [{ id: 's1' }],
    });

    await runIndexer({ moments: null, sales: null });

    expect(momentsIndexer.processBatchFn).toHaveBeenCalledWith([{ id: 'm1' }]);
    expect(salesIndexer.processBatchFn).toHaveBeenCalledWith([{ id: 's1' }]);
  });
});
