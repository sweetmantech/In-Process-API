import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../mapAdminsToSupabase', () => ({ mapAdminsToSupabase: vi.fn() }));
vi.mock('../mapAdminsForDeletion', () => ({ mapAdminsForDeletion: vi.fn() }));
vi.mock('@/lib/supabase/in_process_admins/upsertAdmins', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_admins/deleteAdmins', () => ({
  deleteAdmins: vi.fn(),
}));
vi.mock('@/lib/wallets/ensureWallets', () => ({
  ensureWallets: vi.fn(),
}));

import { processAdminsInBatches } from '../processAdminsInBatches';
import { mapAdminsToSupabase } from '../mapAdminsToSupabase';
import { mapAdminsForDeletion } from '../mapAdminsForDeletion';
import upsertAdmins from '@/lib/supabase/in_process_admins/upsertAdmins';
import { deleteAdmins } from '@/lib/supabase/in_process_admins/deleteAdmins';
import { ensureWallets } from '@/lib/wallets/ensureWallets';

const mockMapAdminsToSupabase = vi.mocked(mapAdminsToSupabase);
const mockMapAdminsForDeletion = vi.mocked(mapAdminsForDeletion);
const mockUpsertAdmins = vi.mocked(upsertAdmins);
const mockDeleteAdmins = vi.mocked(deleteAdmins);
const mockEnsureArtists = vi.mocked(ensureWallets);

const makeAdmin = (permission: number) => ({
  id: '1',
  admin: '0xabc',
  collection: '0xcol',
  token_id: '1',
  chain_id: 8453,
  permission,
  updated_at: 1000,
});

describe('processAdminsInBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureArtists.mockResolvedValue(undefined as any);
    mockUpsertAdmins.mockResolvedValue(undefined as any);
    mockDeleteAdmins.mockResolvedValue(0);
  });

  it('does nothing for empty array', async () => {
    await processAdminsInBatches([]);
    expect(mockMapAdminsToSupabase).not.toHaveBeenCalled();
    expect(mockDeleteAdmins).not.toHaveBeenCalled();
  });

  it('upserts admins with non-zero scope', async () => {
    const admin = makeAdmin(2);
    mockMapAdminsToSupabase.mockResolvedValue([
      {
        collection: 'col-id',
        token_id: 1,
        artist_address: '0xabc',
        granted_at: 'ts',
      },
    ]);

    await processAdminsInBatches([admin]);

    expect(mockMapAdminsToSupabase).toHaveBeenCalledWith([admin]);
    expect(mockEnsureArtists).toHaveBeenCalledWith(['0xabc']);
    expect(mockUpsertAdmins).toHaveBeenCalled();
  });

  it('deletes admins with scope === 0', async () => {
    const admin = makeAdmin(0);
    mockMapAdminsForDeletion.mockResolvedValue([
      { collection: 'col-id', token_id: 1, artist_address: '0xabc' },
    ]);
    mockDeleteAdmins.mockResolvedValue(1);

    await processAdminsInBatches([admin]);

    expect(mockMapAdminsForDeletion).toHaveBeenCalledWith([admin]);
    expect(mockDeleteAdmins).toHaveBeenCalled();
  });

  it('continues processing other batches when one fails', async () => {
    const admin1 = makeAdmin(2);
    const admin2 = makeAdmin(2);
    mockMapAdminsToSupabase
      .mockRejectedValueOnce(new Error('batch error'))
      .mockResolvedValueOnce([
        {
          collection: 'col-id',
          token_id: 2,
          artist_address: '0xdef',
          granted_at: 'ts',
        },
      ]);

    await expect(
      processAdminsInBatches([admin1, admin2])
    ).resolves.not.toThrow();
  });
});
