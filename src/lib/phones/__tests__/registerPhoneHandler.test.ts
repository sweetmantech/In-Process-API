import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_artist_phones/upsertPhone', () => ({
  upsertPhone: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/phones/sendSms', () => ({ sendSms: vi.fn() }));

import { upsertPhone } from '@/lib/supabase/in_process_artist_phones/upsertPhone';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { sendSms } from '@/lib/phones/sendSms';
import registerPhoneHandler from '@/lib/phones/registerPhoneHandler';

const ARTIST = {
  artistId: 'artist-uuid-123',
  primaryWallet: '0x1234567890123456789012345678901234567890' as const,
  wallets: ['0x1234567890123456789012345678901234567890' as const],
};
const PHONE_NUMBER = '+15550001234';

describe('registerPhoneHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(upsertPhone).mockResolvedValue({ error: null, data: null });
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ artist: { username: 'testartist' } }],
      error: null,
    });
    vi.mocked(sendSms).mockResolvedValue(undefined as never);
  });

  it('upserts phone by artist_id and sends verification SMS with username', async () => {
    const res = await registerPhoneHandler({
      artist: ARTIST,
      phone_number: PHONE_NUMBER,
    });

    expect(await res.json()).toEqual({
      success: true,
      message: 'Phone number registered and verification message sent',
    });
    expect(upsertPhone).toHaveBeenCalledWith({
      artist_id: ARTIST.artistId,
      phone_number: PHONE_NUMBER,
      verified: false,
    });
    expect(selectWallets).toHaveBeenCalledWith({
      artistIds: [ARTIST.artistId],
    });
    expect(sendSms).toHaveBeenCalledWith(
      PHONE_NUMBER,
      expect.stringContaining('testartist')
    );
  });

  it('falls back to truncated wallet address when username is missing', async () => {
    vi.mocked(selectWallets).mockResolvedValue({ data: [], error: null });

    await registerPhoneHandler({
      artist: ARTIST,
      phone_number: PHONE_NUMBER,
    });

    expect(sendSms).toHaveBeenCalledWith(
      PHONE_NUMBER,
      expect.stringContaining('0x1234…7890')
    );
  });

  it('throws when upsert fails', async () => {
    vi.mocked(upsertPhone).mockResolvedValue({
      error: { message: 'duplicate key' },
      data: null,
    });

    await expect(
      registerPhoneHandler({ artist: ARTIST, phone_number: PHONE_NUMBER })
    ).rejects.toThrow('Failed to insert phone number: duplicate key');
    expect(sendSms).not.toHaveBeenCalled();
  });
});
