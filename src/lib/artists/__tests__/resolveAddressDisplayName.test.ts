import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/farcaster/getFarcasterUsernameByAddress', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/ens/resolveAddressToEns', () => ({ default: vi.fn() }));

import resolveAddressDisplayName from '../resolveAddressDisplayName';
import getFarcasterUsernameByAddress from '@/lib/farcaster/getFarcasterUsernameByAddress';
import resolveAddressToEns from '@/lib/ens/resolveAddressToEns';

const mockGetFarcasterUsername = vi.mocked(getFarcasterUsernameByAddress);
const mockResolveEns = vi.mocked(resolveAddressToEns);

describe('resolveAddressDisplayName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the Farcaster username without checking ENS', async () => {
    mockGetFarcasterUsername.mockResolvedValue('alice');

    const result = await resolveAddressDisplayName('0xABC');

    expect(result).toBe('alice');
    expect(mockResolveEns).not.toHaveBeenCalled();
  });

  it('falls back to ENS when Farcaster has no username', async () => {
    mockGetFarcasterUsername.mockResolvedValue(undefined);
    mockResolveEns.mockResolvedValue('alice.eth');

    const result = await resolveAddressDisplayName('0xABC');

    expect(mockResolveEns).toHaveBeenCalledWith('0xABC');
    expect(result).toBe('alice.eth');
  });

  it('returns null when neither Farcaster nor ENS resolve', async () => {
    mockGetFarcasterUsername.mockResolvedValue(undefined);
    mockResolveEns.mockResolvedValue(null);

    const result = await resolveAddressDisplayName('0xABC');

    expect(result).toBeNull();
  });
});
