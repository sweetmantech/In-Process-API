import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/consts', () => ({
  GRPC_ENDPOINT: 'https://indexer.example.com/graphql',
}));

import { queryGrpc } from '../queryGrpc';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('queryGrpc', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends POST with query and variables', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { Moments: [{ id: '1' }] } }),
    });

    const vars = { limit: 10, offset_moments: 0, minTimestamp_moments: 0 };
    await queryGrpc('query GetAll { Moments { id } }', vars);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://indexer.example.com/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'query GetAll { Moments { id } }',
          variables: vars,
        }),
      })
    );
  });

  it('returns data from successful response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { Moments: [{ id: '1' }] } }),
    });

    const result = await queryGrpc('query', {});
    expect(result).toEqual({ Moments: [{ id: '1' }] });
  });

  it('returns empty object when data is missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const result = await queryGrpc('query', {});
    expect(result).toEqual({});
  });

  it('throws on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(queryGrpc('query', {})).rejects.toThrow(
      'HTTP error! status: 500'
    );
  });

  it('throws when GraphQL errors are present', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: 'field not found' }] }),
    });

    await expect(queryGrpc('query', {})).rejects.toThrow('GraphQL errors:');
  });
});
