import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_metadata/selectMetadata', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/protocolSdk/ipfs/token-metadata', () => ({
  fetchTokenMetadata: vi.fn(),
}));

import selectMetadata from '@/lib/supabase/in_process_metadata/selectMetadata';
import { fetchTokenMetadata } from '@/lib/protocolSdk/ipfs/token-metadata';
import getMetadata from '@/lib/moment/getMetadata';

const MOMENT_ID = 'moment-uuid-123';
const URI = 'ar://metadata-hash';

const cachedMetadata = {
  id: MOMENT_ID,
  name: 'Cached Moment',
  image: 'ar://image-hash',
  description: 'From DB',
  external_url: null,
  animation_url: null,
  content: null,
};

const fetchedMetadata = {
  name: 'Fetched Moment',
  image: 'ar://image-hash',
  description: 'From chain',
};

describe('getMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns cached metadata from DB when available', async () => {
    vi.mocked(selectMetadata).mockResolvedValue(cachedMetadata as any);

    const result = await getMetadata(MOMENT_ID, URI);

    expect(selectMetadata).toHaveBeenCalledWith(MOMENT_ID);
    expect(fetchTokenMetadata).not.toHaveBeenCalled();
    expect(result).toEqual(cachedMetadata);
  });

  it('falls back to fetchTokenMetadata when DB returns null', async () => {
    vi.mocked(selectMetadata).mockResolvedValue(null);
    vi.mocked(fetchTokenMetadata).mockResolvedValue(fetchedMetadata as any);

    const result = await getMetadata(MOMENT_ID, URI);

    expect(selectMetadata).toHaveBeenCalledWith(MOMENT_ID);
    expect(fetchTokenMetadata).toHaveBeenCalledWith(URI);
    expect(result).toEqual(fetchedMetadata);
  });

  it('skips DB lookup when momentId is null', async () => {
    vi.mocked(fetchTokenMetadata).mockResolvedValue(fetchedMetadata as any);

    const result = await getMetadata(null, URI);

    expect(selectMetadata).not.toHaveBeenCalled();
    expect(fetchTokenMetadata).toHaveBeenCalledWith(URI);
    expect(result).toEqual(fetchedMetadata);
  });

  it('returns null when fetchTokenMetadata throws', async () => {
    vi.mocked(selectMetadata).mockResolvedValue(null);
    vi.mocked(fetchTokenMetadata).mockRejectedValue(new Error('Network error'));

    const result = await getMetadata(MOMENT_ID, URI);

    expect(result).toBeNull();
  });

  it('returns null when momentId is null and fetchTokenMetadata throws', async () => {
    vi.mocked(fetchTokenMetadata).mockRejectedValue(new Error('Not found'));

    const result = await getMetadata(null, URI);

    expect(result).toBeNull();
  });
});
