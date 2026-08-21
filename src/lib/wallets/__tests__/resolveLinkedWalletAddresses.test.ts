import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));

import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import resolveLinkedWalletAddresses from '../resolveLinkedWalletAddresses';

const SMART = '0x75e075daecc247dcb42b405c26251debcd87a271';
const EXTERNAL = '0x7b753919b953b1021a33f55671716dc13c1eae08';
const PRIVY = '0x7bb5b5661c22d2574fbf3f0463fbf6ae2bb6b866';
const ARTIST_ID = 'b04d9382-bd85-47b1-91bc-5db642f1b45b';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('resolveLinkedWalletAddresses', () => {
  it('returns all linked wallet addresses for the artist', async () => {
    vi.mocked(selectWallets)
      .mockResolvedValueOnce({
        data: [{ address: SMART, artist_id: ARTIST_ID }],
      } as never)
      .mockResolvedValueOnce({
        data: [
          { address: SMART, artist_id: ARTIST_ID },
          { address: EXTERNAL, artist_id: ARTIST_ID },
          { address: PRIVY, artist_id: ARTIST_ID },
        ],
      } as never);

    await expect(resolveLinkedWalletAddresses(SMART)).resolves.toEqual([
      SMART,
      EXTERNAL,
      PRIVY,
    ]);

    expect(selectWallets).toHaveBeenNthCalledWith(1, { addresses: [SMART] });
    expect(selectWallets).toHaveBeenNthCalledWith(2, {
      artistIds: [ARTIST_ID],
    });
  });

  it('returns [] when no wallet matches the address', async () => {
    vi.mocked(selectWallets).mockResolvedValue({ data: [] } as never);

    await expect(
      resolveLinkedWalletAddresses('0x7B753919B953B1021A33F55671716DC13C1EAE08')
    ).resolves.toEqual([]);
  });

  it('returns [] when wallet has no artist_id', async () => {
    vi.mocked(selectWallets).mockResolvedValue({
      data: [{ address: EXTERNAL, artist_id: null }],
    } as never);

    await expect(resolveLinkedWalletAddresses(EXTERNAL)).resolves.toEqual([]);
  });
});
