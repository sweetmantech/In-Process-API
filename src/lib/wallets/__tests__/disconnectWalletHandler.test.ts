import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_wallets/upsertWallets', () => ({
  default: vi.fn(),
}));

import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import disconnectWalletHandler from '@/lib/wallets/disconnectWalletHandler';

describe('disconnectWalletHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears artist from wallet and returns success', async () => {
    const res = await disconnectWalletHandler({
      address: '0xABC',
    });

    expect(await res.json()).toEqual({ success: true });
    expect(upsertWallets).toHaveBeenCalledWith([
      { address: '0xabc', artist: null },
    ]);
  });
});
