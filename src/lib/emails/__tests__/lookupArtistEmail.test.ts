import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/privy/getEmailByWalletAddress', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/privy/isPrivyWalletAddress', () => ({
  default: vi.fn(),
}));

import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import getEmailByWalletAddress from '@/lib/privy/getEmailByWalletAddress';
import isPrivyWalletAddress from '@/lib/privy/isPrivyWalletAddress';
import lookupArtistEmail from '../lookupArtistEmail';

describe('lookupArtistEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns email using a type=null candidate after Privy verification', async () => {
    vi.mocked(selectWallets).mockImplementation(async (args: any) => {
      if (args.addresses) {
        return { data: [{ artist_id: 'artist-1' }] } as any;
      }

      if (args.artistIds) {
        return {
          data: [
            { address: '0xmaybe-privy', type: null },
            { address: '0xdefinitely-privy', type: 'privy' },
          ],
        } as any;
      }

      return { data: [] } as any;
    });

    vi.mocked(isPrivyWalletAddress).mockImplementation(async (address) => {
      return address.toLowerCase() === '0xmaybe-privy';
    });

    vi.mocked(getEmailByWalletAddress).mockResolvedValue('creator@example.com');

    await expect(lookupArtistEmail('0xartist-wallet')).resolves.toBe(
      'creator@example.com'
    );

    expect(isPrivyWalletAddress).toHaveBeenCalled();
    expect(getEmailByWalletAddress).toHaveBeenCalledWith('0xmaybe-privy');
  });

  it('returns null when no candidate passes Privy verification', async () => {
    vi.mocked(selectWallets).mockImplementation(async (args: any) => {
      if (args.addresses) {
        return { data: [{ artist_id: 'artist-1' }] } as any;
      }
      return {
        data: [
          { address: '0xwallet-a', type: null },
          { address: '0xwallet-b', type: 'privy' },
        ],
      } as any;
    });

    vi.mocked(isPrivyWalletAddress).mockResolvedValue(false);

    await expect(lookupArtistEmail('0xartist-wallet')).resolves.toBe(null);
    expect(getEmailByWalletAddress).not.toHaveBeenCalled();
  });

  it('returns null when artistId is missing', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [],
    } as any);

    await expect(lookupArtistEmail('0xunknown')).resolves.toBe(null);
    expect(isPrivyWalletAddress).not.toHaveBeenCalled();
    expect(getEmailByWalletAddress).not.toHaveBeenCalled();
  });
});
