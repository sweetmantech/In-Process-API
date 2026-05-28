import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artist_phones/deletePhone', () => ({
  deletePhone: vi.fn(),
}));

import { deletePhone } from '@/lib/supabase/in_process_artist_phones/deletePhone';
import deletePhoneHandler from '@/lib/phones/deletePhoneHandler';

const ARTIST = {
  artistId: 'artist-uuid-123',
  primaryWallet: '0x1234567890123456789012345678901234567890' as const,
  wallets: ['0x1234567890123456789012345678901234567890' as const],
};

describe('deletePhoneHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deletePhone).mockResolvedValue({ error: null, data: null });
  });

  it('deletes phone by artist_id and returns success', async () => {
    const res = await deletePhoneHandler({ artist: ARTIST });

    expect(await res.json()).toEqual({
      success: true,
      message: 'Phone number is disconnected successfully',
    });
    expect(deletePhone).toHaveBeenCalledWith(ARTIST.artistId);
  });

  it('throws when delete fails', async () => {
    vi.mocked(deletePhone).mockResolvedValue({
      error: { message: 'not found' },
      data: null,
    });

    await expect(deletePhoneHandler({ artist: ARTIST })).rejects.toThrow(
      'Failed to disconnect phone number: not found'
    );
  });
});
