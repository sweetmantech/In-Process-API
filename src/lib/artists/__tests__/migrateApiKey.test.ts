import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_api_keys/getApiKeys', () => ({
  getApiKeys: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_api_keys/updateApiKey', () => ({
  updateApiKey: vi.fn(),
}));

import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import { updateApiKey } from '@/lib/supabase/in_process_api_keys/updateApiKey';
import migrateApiKey from '@/lib/artists/migrateApiKey';

describe('migrateApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateApiKey).mockResolvedValue({ error: null });
  });

  it('does nothing when social wallet has no api keys', async () => {
    vi.mocked(getApiKeys).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    await migrateApiKey({
      from: '0xb234567890123456789012345678901234567891',
      to: '0xa123456789012345678901234567890123456789',
    });

    expect(getApiKeys).toHaveBeenCalledWith(
      '0xb234567890123456789012345678901234567891'
    );
    expect(updateApiKey).not.toHaveBeenCalled();
  });

  it('moves the most recent api key artist_address to the artist wallet (lowercased)', async () => {
    vi.mocked(getApiKeys).mockResolvedValue({
      data: [{ id: 'key-1', name: 'a', created_at: 't2' }],
      error: null,
    } as any);

    await migrateApiKey({
      from: '0xB234567890123456789012345678901234567891',
      to: '0xA123456789012345678901234567890123456789',
    });

    expect(getApiKeys).toHaveBeenCalledWith(
      '0xb234567890123456789012345678901234567891'
    );
    expect(updateApiKey).toHaveBeenCalledWith(
      'key-1',
      '0xa123456789012345678901234567890123456789'
    );
  });

  it('throws when getApiKeys returns an error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getApiKeys).mockResolvedValue({
      data: null,
      error: { message: 'db' },
    } as any);

    await expect(
      migrateApiKey({
        from: '0xb2',
        to: '0xa1',
      })
    ).rejects.toThrow('Failed to migrate api key');
    errSpy.mockRestore();
  });

  it('throws when updateApiKey returns an error', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getApiKeys).mockResolvedValue({
      data: [{ id: 'key-1', name: 'a', created_at: 't' }],
      error: null,
    } as any);
    vi.mocked(updateApiKey).mockResolvedValue({
      error: { message: 'update failed' },
    } as any);

    await expect(
      migrateApiKey({
        from: '0xb2',
        to: '0xa1',
      })
    ).rejects.toThrow('Failed to migrate api key');
    errSpy.mockRestore();
  });
});
