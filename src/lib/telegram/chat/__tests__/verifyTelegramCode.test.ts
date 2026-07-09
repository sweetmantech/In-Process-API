import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/authenticatePrivyPasswordless', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/privy/ensurePrivySocialWallet', () => ({ default: vi.fn() }));
vi.mock('@/lib/artists/getOrCreateArtist', () => ({ default: vi.fn() }));
vi.mock('@/lib/supabase/in_process_artists/upsertArtists', () => ({
  upsertArtists: vi.fn(),
}));
vi.mock('../clearPendingCode', () => ({ default: vi.fn() }));

import authenticatePrivyPasswordless from '@/lib/privy/authenticatePrivyPasswordless';
import ensurePrivySocialWallet from '@/lib/privy/ensurePrivySocialWallet';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import clearPendingCode from '../clearPendingCode';
import verifyTelegramCode from '../verifyTelegramCode';

const TG_USERNAME = 'testuser';
const PENDING = {
  email: 'user@example.com',
  artistId: 'uuid-artist-1234',
  username: 'alice',
};
const NEW_WALLET_ADDRESS = '0xNewWallet';
const NEW_ARTIST_ID = 'uuid-new-artist';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(upsertArtists).mockResolvedValue([{ id: PENDING.artistId }]);
  vi.mocked(clearPendingCode).mockResolvedValue(undefined);
  vi.mocked(ensurePrivySocialWallet).mockResolvedValue(NEW_WALLET_ADDRESS);
  vi.mocked(getOrCreateArtist).mockResolvedValue({
    artistId: NEW_ARTIST_ID,
    primaryWallet: NEW_WALLET_ADDRESS,
    wallets: [],
  } as never);
});

describe('verifyTelegramCode', () => {
  it('rejects a malformed code without calling Privy', async () => {
    const thread = makeThread();

    await verifyTelegramCode(thread as never, 'abc', TG_USERNAME, PENDING);

    expect(authenticatePrivyPasswordless).not.toHaveBeenCalled();
    expect(upsertArtists).not.toHaveBeenCalled();
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining("doesn't look right")
    );
  });

  it('replies with an invalid-code message when Privy rejects the code', async () => {
    vi.mocked(authenticatePrivyPasswordless).mockRejectedValue(
      new Error('Invalid code')
    );
    const thread = makeThread();

    await verifyTelegramCode(thread as never, '123456', TG_USERNAME, PENDING);

    expect(authenticatePrivyPasswordless).toHaveBeenCalledWith(
      PENDING.email,
      '123456'
    );
    expect(upsertArtists).not.toHaveBeenCalled();
    expect(clearPendingCode).not.toHaveBeenCalled();
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining("doesn't look right")
    );
  });

  it('links the artist and clears pending state when the code is verified', async () => {
    vi.mocked(authenticatePrivyPasswordless).mockResolvedValue({} as never);
    const thread = makeThread();

    await verifyTelegramCode(thread as never, '123456', TG_USERNAME, PENDING);

    expect(upsertArtists).toHaveBeenCalledWith({
      id: PENDING.artistId,
      telegram: TG_USERNAME,
    });
    expect(clearPendingCode).toHaveBeenCalledWith(thread);
    expect(ensurePrivySocialWallet).not.toHaveBeenCalled();
    expect(getOrCreateArtist).not.toHaveBeenCalled();
    expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('alice'));
  });

  it('creates a wallet and artist, then links telegram, when no artist was matched', async () => {
    const authResult = { user: { id: 'privy-user-1' } };
    vi.mocked(authenticatePrivyPasswordless).mockResolvedValue(
      authResult as never
    );
    const thread = makeThread();
    const unmatchedPending = { ...PENDING, artistId: null, username: null };

    await verifyTelegramCode(
      thread as never,
      '123456',
      TG_USERNAME,
      unmatchedPending
    );

    expect(ensurePrivySocialWallet).toHaveBeenCalledWith(authResult);
    expect(getOrCreateArtist).toHaveBeenCalledWith({
      address: NEW_WALLET_ADDRESS,
      type: 'privy',
    });
    expect(upsertArtists).toHaveBeenCalledWith({
      id: NEW_ARTIST_ID,
      telegram: TG_USERNAME,
    });
    expect(clearPendingCode).toHaveBeenCalledWith(thread);
    expect(thread.post).toHaveBeenCalledWith(
      expect.stringContaining('Welcome to In Process')
    );
  });
});
