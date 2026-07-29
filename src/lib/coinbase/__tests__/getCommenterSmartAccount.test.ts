import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCommenterSmartAccount } from '../getCommenterSmartAccount';
import { IN_PROCESS_COMMENTER_ACCOUNT_NAME } from '@/lib/consts';

vi.mock('@/lib/coinbase/client', () => ({
  default: {
    evm: {
      getOrCreateAccount: vi.fn(),
      getOrCreateSmartAccount: vi.fn(),
    },
  },
}));

import cdp from '@/lib/coinbase/client';

const mockCdp = vi.mocked(cdp);
const mockEvmAccount = {
  name: IN_PROCESS_COMMENTER_ACCOUNT_NAME,
  address: '0x1111111111111111111111111111111111111111',
};
const mockSmartAccount = {
  address: '0x2222222222222222222222222222222222222222',
};

describe('getCommenterSmartAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCdp.evm.getOrCreateAccount.mockResolvedValue(mockEvmAccount as never);
    mockCdp.evm.getOrCreateSmartAccount.mockResolvedValue(
      mockSmartAccount as never
    );
  });

  it('gets or creates the in-process-commenter CDP smart account', async () => {
    const result = await getCommenterSmartAccount();

    expect(mockCdp.evm.getOrCreateAccount).toHaveBeenCalledWith({
      name: IN_PROCESS_COMMENTER_ACCOUNT_NAME,
    });
    expect(mockCdp.evm.getOrCreateSmartAccount).toHaveBeenCalledWith({
      name: IN_PROCESS_COMMENTER_ACCOUNT_NAME,
      owner: mockEvmAccount,
    });
    expect(result).toBe(mockSmartAccount);
  });
});
