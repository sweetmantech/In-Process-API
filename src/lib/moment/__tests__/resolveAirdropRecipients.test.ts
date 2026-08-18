import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/ensurePrivyWalletByEmail', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/artists/getOrCreateArtist', () => ({
  default: vi.fn(),
}));

import ensurePrivyWalletByEmail from '@/lib/privy/ensurePrivyWalletByEmail';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import resolveAirdropRecipients from '@/lib/moment/resolveAirdropRecipients';

const RECIPIENT = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const EMAIL = 'collector@example.com';
const PRIVY_WALLET = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc';
const PRIMARY_WALLET = '0x90f79bf6eb2c4f870365e785982e1f101b93bdae';

describe('resolveAirdropRecipients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ensurePrivyWalletByEmail).mockResolvedValue(
      PRIVY_WALLET as `0x${string}`
    );
    vi.mocked(getOrCreateArtist).mockResolvedValue({
      artistId: 'artist-uuid',
      primaryWallet: PRIMARY_WALLET as `0x${string}`,
      wallets: [],
    });
  });

  it('passes through wallet addresses unchanged', async () => {
    const result = await resolveAirdropRecipients([RECIPIENT]);

    expect(result).toEqual([RECIPIENT.toLowerCase()]);
    expect(ensurePrivyWalletByEmail).not.toHaveBeenCalled();
    expect(getOrCreateArtist).not.toHaveBeenCalled();
  });

  it('airdrops email recipients to the linked primary wallet', async () => {
    const result = await resolveAirdropRecipients([EMAIL]);

    expect(ensurePrivyWalletByEmail).toHaveBeenCalledWith(EMAIL);
    expect(getOrCreateArtist).toHaveBeenCalledWith({
      address: PRIVY_WALLET,
      type: 'privy',
    });
    expect(result).toEqual([PRIMARY_WALLET]);
  });

  it('resolves mixed address and email recipients', async () => {
    const result = await resolveAirdropRecipients([RECIPIENT, EMAIL]);

    expect(result).toEqual([RECIPIENT.toLowerCase(), PRIMARY_WALLET]);
  });
});
