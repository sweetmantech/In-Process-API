import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/splits/getSplitAdminAddresses', () => ({
  getSplitAdminAddresses: vi.fn(),
}));

vi.mock('@/lib/zora/addPermissionCall', () => ({
  addPermissionCall: vi.fn(),
}));

import { getSplitAdminAddresses } from '@/lib/splits/getSplitAdminAddresses';
import { addPermissionCall } from '@/lib/zora/addPermissionCall';
import buildPermissionSetupActions from '@/lib/moment/buildPermissionSetupActions';

const SMART_ACCOUNT = '0x1111111111111111111111111111111111111111' as const;
const SPLIT_ADDR = '0x2222222222222222222222222222222222222222' as const;
const SPLIT_WALLET = '0x3333333333333333333333333333333333333333' as const;

const split1 = {
  address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  percentAllocation: 50,
};
const split2 = {
  address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  percentAllocation: 50,
};

describe('buildPermissionSetupActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSplitAdminAddresses).mockResolvedValue({
      addresses: [SPLIT_ADDR],
      smartWallets: [SPLIT_WALLET],
    } as any);
    vi.mocked(addPermissionCall).mockReturnValue('0xpermission' as any);
  });

  it('returns a function when splits exist', async () => {
    const result = await buildPermissionSetupActions({
      splits: [split1, split2],
      smartAccountAddress: SMART_ACCOUNT,
    });

    expect(result).toBeTypeOf('function');
  });

  it('returns a function when no splits', async () => {
    const result = await buildPermissionSetupActions({
      splits: [],
      smartAccountAddress: SMART_ACCOUNT,
    });

    expect(result).toBeTypeOf('function');
  });

  it('does not call getSplitAdminAddresses when no splits', async () => {
    await buildPermissionSetupActions({
      splits: [],
      smartAccountAddress: SMART_ACCOUNT,
    });

    expect(getSplitAdminAddresses).not.toHaveBeenCalled();
  });

  it('calls getSplitAdminAddresses with the resolved splits', async () => {
    await buildPermissionSetupActions({
      splits: [split1, split2],
      smartAccountAddress: SMART_ACCOUNT,
    });

    expect(getSplitAdminAddresses).toHaveBeenCalledWith([split1, split2]);
  });

  describe('returned permission setup function', () => {
    it('adds collection-level permission for smart account at tokenId 0', async () => {
      const permissionSetup = await buildPermissionSetupActions({
        splits: [split1],
        smartAccountAddress: SMART_ACCOUNT,
      });

      permissionSetup({ tokenId: 3n });

      expect(addPermissionCall).toHaveBeenCalledWith(SMART_ACCOUNT, 0n);
    });

    it('adds token-level permission for each split address and smart wallet', async () => {
      const permissionSetup = await buildPermissionSetupActions({
        splits: [split1],
        smartAccountAddress: SMART_ACCOUNT,
      });

      permissionSetup({ tokenId: 5n });

      expect(addPermissionCall).toHaveBeenCalledWith(SPLIT_ADDR, 5n);
      expect(addPermissionCall).toHaveBeenCalledWith(SPLIT_WALLET, 5n);
    });

    it('returns actions in order: smart account first, then split addresses', async () => {
      vi.mocked(addPermissionCall)
        .mockReturnValueOnce('0xcollection' as any)
        .mockReturnValueOnce('0xsplit_addr' as any)
        .mockReturnValueOnce('0xsplit_wallet' as any);

      const permissionSetup = await buildPermissionSetupActions({
        splits: [split1],
        smartAccountAddress: SMART_ACCOUNT,
      });

      const actions = permissionSetup({ tokenId: 1n });

      expect(actions).toEqual([
        '0xcollection',
        '0xsplit_addr',
        '0xsplit_wallet',
      ]);
    });

    it('produces only smart account permission when no splits', async () => {
      vi.mocked(addPermissionCall).mockReturnValueOnce('0xcollection' as any);

      const permissionSetup = await buildPermissionSetupActions({
        splits: [],
        smartAccountAddress: SMART_ACCOUNT,
      });

      const actions = permissionSetup({ tokenId: 2n });

      expect(actions).toEqual(['0xcollection']);
      expect(addPermissionCall).toHaveBeenCalledTimes(1);
    });
  });
});
