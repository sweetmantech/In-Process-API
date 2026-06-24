import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress } from 'viem';
import isCoinbaseSmartWallet from '../isCoinbaseSmartWallet';
import isSmartWalletOwnerAddress from '../isSmartWalletOwnerAddress';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import ensureSmartWalletOwnerAddress from '../ensureSmartWalletOwnerAddress';

vi.mock('../isCoinbaseSmartWallet', () => ({ default: vi.fn() }));
vi.mock('../isSmartWalletOwnerAddress', () => ({ default: vi.fn() }));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/consts', () => ({ IS_TESTNET: false, CHAIN_ID: 8453 }));

const mockIsDeployed = vi.mocked(isCoinbaseSmartWallet);
const mockIsOwner = vi.mocked(isSmartWalletOwnerAddress);
const mockSendUserOp = vi.mocked(sendUserOperation);

const ownerAddress = getAddress('0x2222222222222222222222222222222222222222');
const smartAccount = {
  address: getAddress('0x1111111111111111111111111111111111111111'),
} as never;

describe('ensureSmartWalletOwnerAddress', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('when smart wallet is already deployed', () => {
    beforeEach(() => mockIsDeployed.mockResolvedValue(true));

    it('does nothing when address is already an owner', async () => {
      mockIsOwner.mockResolvedValue(true);
      await ensureSmartWalletOwnerAddress(smartAccount, ownerAddress);
      expect(mockSendUserOp).not.toHaveBeenCalled();
    });

    it('sends addOwnerAddress user operation when address is not yet an owner', async () => {
      mockIsOwner.mockResolvedValue(false);
      mockSendUserOp.mockResolvedValue({ transactionHash: '0xabc' } as never);

      await ensureSmartWalletOwnerAddress(smartAccount, ownerAddress);

      expect(mockSendUserOp).toHaveBeenCalledOnce();
      const call = mockSendUserOp.mock.calls[0][0];
      expect(call.smartAccount).toBe(smartAccount);
      expect(call.network).toBe('base');
      expect(call.calls[0].to).toBe(smartAccount.address);
    });
  });

  describe('when smart wallet is not yet deployed', () => {
    beforeEach(() => mockIsDeployed.mockResolvedValue(false));

    it('skips isOwnerAddress check and sends addOwnerAddress to deploy and register owner', async () => {
      mockSendUserOp.mockResolvedValue({ transactionHash: '0xabc' } as never);

      await ensureSmartWalletOwnerAddress(smartAccount, ownerAddress);

      expect(mockIsOwner).not.toHaveBeenCalled();
      expect(mockSendUserOp).toHaveBeenCalledOnce();
      const call = mockSendUserOp.mock.calls[0][0];
      expect(call.smartAccount).toBe(smartAccount);
      expect(call.network).toBe('base');
      expect(call.calls[0].to).toBe(smartAccount.address);
    });
  });
});
