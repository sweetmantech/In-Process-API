import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/privy/client', () => ({
  default: {
    users: vi.fn(),
  },
}));

vi.mock('@/lib/privy/getPrivyUserByEmail', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/privy/ensurePrivySocialWallet', () => ({
  default: vi.fn(),
}));

import privyClient from '@/lib/privy/client';
import getPrivyUserByEmail from '@/lib/privy/getPrivyUserByEmail';
import ensurePrivySocialWallet from '@/lib/privy/ensurePrivySocialWallet';
import ensurePrivyWalletByEmail from '@/lib/privy/ensurePrivyWalletByEmail';

const EMAIL = 'artist@example.com';
const EXISTING_WALLET = '0xexistingwallet000000000000000000000001';
const NEW_WALLET = '0xnewwallet000000000000000000000000000001';

describe('ensurePrivyWalletByEmail', () => {
  const create = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(privyClient.users).mockReturnValue({ create } as never);
  });

  it('returns existing privy wallet for a known email', async () => {
    vi.mocked(getPrivyUserByEmail).mockResolvedValue({
      id: 'did:privy:abc',
      linked_accounts: [
        {
          type: 'wallet',
          wallet_client_type: 'privy',
          address: EXISTING_WALLET,
        },
      ],
    } as never);
    vi.mocked(ensurePrivySocialWallet).mockResolvedValue(EXISTING_WALLET);

    const wallet = await ensurePrivyWalletByEmail(EMAIL);

    expect(getPrivyUserByEmail).toHaveBeenCalledWith(EMAIL);
    expect(ensurePrivySocialWallet).toHaveBeenCalledWith({
      user: {
        id: 'did:privy:abc',
        linked_accounts: [
          {
            type: 'wallet',
            wallet_client_type: 'privy',
            address: EXISTING_WALLET,
          },
        ],
      },
    });
    expect(wallet).toBe(EXISTING_WALLET);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates an embedded wallet when user exists without one', async () => {
    vi.mocked(getPrivyUserByEmail).mockResolvedValue({
      id: 'did:privy:abc',
      linked_accounts: [{ type: 'email', address: EMAIL }],
    } as never);
    vi.mocked(ensurePrivySocialWallet).mockResolvedValue(NEW_WALLET);

    const wallet = await ensurePrivyWalletByEmail(EMAIL);

    expect(ensurePrivySocialWallet).toHaveBeenCalled();
    expect(wallet).toBe(NEW_WALLET);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a privy user then ensures a wallet when email is unknown', async () => {
    vi.mocked(getPrivyUserByEmail).mockResolvedValue(null);
    create.mockResolvedValue({
      id: 'did:privy:new',
      linked_accounts: [{ type: 'email', address: EMAIL }],
    });
    vi.mocked(ensurePrivySocialWallet).mockResolvedValue(NEW_WALLET);

    const wallet = await ensurePrivyWalletByEmail(EMAIL);

    expect(create).toHaveBeenCalledWith({
      linked_accounts: [{ type: 'email', address: EMAIL }],
    });
    expect(ensurePrivySocialWallet).toHaveBeenCalledWith({
      user: {
        id: 'did:privy:new',
        linked_accounts: [{ type: 'email', address: EMAIL }],
      },
    });
    expect(wallet).toBe(NEW_WALLET);
  });
});
