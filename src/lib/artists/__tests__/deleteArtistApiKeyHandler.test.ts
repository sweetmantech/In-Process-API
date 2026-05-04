import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_api_keys/deleteApiKey', () => ({
  deleteApiKey: vi.fn(),
}));

import { deleteApiKey } from '@/lib/supabase/in_process_api_keys/deleteApiKey';
import deleteArtistApiKeyHandler from '@/lib/artists/deleteArtistApiKeyHandler';

describe('deleteArtistApiKeyHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deleteApiKey).mockResolvedValue({ error: null } as any);
  });

  it('returns success when delete succeeds', async () => {
    const res = await deleteArtistApiKeyHandler('kid');
    const json = await res.json();

    expect(deleteApiKey).toHaveBeenCalledWith('kid');
    expect(json).toEqual({ message: 'API key deleted successfully' });
  });

  it('throws when deleteApiKey returns error', async () => {
    vi.mocked(deleteApiKey).mockResolvedValue({
      error: { message: 'e' },
    } as any);

    await expect(deleteArtistApiKeyHandler('kid')).rejects.toThrow(
      'Failed to delete API key'
    );
  });
});
