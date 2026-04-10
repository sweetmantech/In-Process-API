import { describe, it, expect } from 'vitest';
import { buildQuery } from '../buildQuery';
import type { IndexConfig } from '@/types/indexerFactory';

const makeIndexer = (
  indexName: string,
  queryFragment: string
): IndexConfig<any> => ({
  indexName,
  queryFragment,
  dataPath: indexName,
  processBatchFn: async () => {},
  selectMaxTimestampFn: async () => null,
});

describe('buildQuery', () => {
  it('always includes $limit in var definitions', () => {
    const query = buildQuery([
      makeIndexer('moments', 'Moments(limit: $limit) { id }'),
    ]);
    expect(query).toContain('$limit: Int');
  });

  it('includes offset and minTimestamp vars for each indexer', () => {
    const query = buildQuery([
      makeIndexer('moments', 'Moments(limit: $limit) { id }'),
    ]);
    expect(query).toContain('$offset_moments: Int');
    expect(query).toContain('$minTimestamp_moments: Int');
  });

  it('includes query fragments in body', () => {
    const fragment = 'Moments(limit: $limit, offset: $offset_moments) { id }';
    const query = buildQuery([makeIndexer('moments', fragment)]);
    expect(query).toContain(fragment);
  });

  it('builds correct structure for multiple indexers', () => {
    const indexers = [
      makeIndexer('moments', 'Moments { id }'),
      makeIndexer('sales', 'Sales { id }'),
    ];
    const query = buildQuery(indexers);
    expect(query).toContain('$offset_moments: Int');
    expect(query).toContain('$offset_sales: Int');
    expect(query).toContain('$minTimestamp_moments: Int');
    expect(query).toContain('$minTimestamp_sales: Int');
    expect(query).toContain('Moments { id }');
    expect(query).toContain('Sales { id }');
  });

  it('wraps query in GetAll operation', () => {
    const query = buildQuery([makeIndexer('moments', 'Moments { id }')]);
    expect(query).toMatch(/^query GetAll\(/);
  });

  it('returns minimal query for empty indexers', () => {
    const query = buildQuery([]);
    expect(query).toContain('query GetAll($limit: Int)');
  });
});
