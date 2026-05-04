import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_api_keys/getApiKeys', () => ({
  getApiKeys: vi.fn(),
}));

import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import getArtistApiKeysHandler from '@/lib/artists/getArtistApiKeysHandler';

describe('getArtistApiKeysHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns keys from supabase', async () => {
    const rows = [{ id: '1', name: 'a', created_at: 't' }];
    vi.mocked(getApiKeys).mockResolvedValue({ data: rows, error: null } as any);

    const res = await getArtistApiKeysHandler(
      '0xa123456789012345678901234567890123456789'
    );
    const json = await res.json();

    expect(getApiKeys).toHaveBeenCalledWith(
      '0xa123456789012345678901234567890123456789'
    );
    expect(json).toEqual({ keys: rows });
  });

  it('throws when getApiKeys returns error', async () => {
    vi.mocked(getApiKeys).mockResolvedValue({
      data: null,
      error: { message: 'db' },
    } as any);

    await expect(
      getArtistApiKeysHandler('0xa123456789012345678901234567890123456789')
    ).rejects.toThrow('Failed to fetch API keys');
  });
});
