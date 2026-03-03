import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>();
  return { ...actual, parseEventLogs: vi.fn() };
});

import { parseEventLogs } from 'viem';
import parseMomentTransaction from '@/lib/moment/parseMomentTransaction';

const mockParseEventLogs = vi.mocked(parseEventLogs);

const CONTRACT = '0x1111111111111111111111111111111111111111';
const NEW_CONTRACT = '0x2222222222222222222222222222222222222222';
const LOGS: any[] = [];

describe('parseMomentTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('new contract', () => {
    beforeEach(() => {
      mockParseEventLogs
        .mockReturnValueOnce([{ args: { tokenId: 5n } }] as any) // SetupNewToken
        .mockReturnValueOnce([{ args: { newContract: NEW_CONTRACT } }] as any); // SetupNewContract
    });

    it('extracts tokenId as string from SetupNewToken event', () => {
      const { tokenId } = parseMomentTransaction({
        logs: LOGS,
        isNewContract: true,
      });

      expect(tokenId).toBe('5');
    });

    it('extracts contractAddress from SetupNewContract event', () => {
      const { contractAddress } = parseMomentTransaction({
        logs: LOGS,
        isNewContract: true,
      });

      expect(contractAddress).toBe(NEW_CONTRACT);
    });
  });

  describe('existing contract', () => {
    beforeEach(() => {
      mockParseEventLogs.mockReturnValueOnce([
        { args: { tokenId: 3n } },
      ] as any);
    });

    it('extracts tokenId and uses the provided contract address', () => {
      const { tokenId, contractAddress } = parseMomentTransaction({
        logs: LOGS,
        isNewContract: false,
        existingContractAddress: CONTRACT,
      });

      expect(tokenId).toBe('3');
      expect(contractAddress.toLowerCase()).toBe(CONTRACT.toLowerCase());
    });

    it('parses only one event log when not a new contract', () => {
      parseMomentTransaction({
        logs: LOGS,
        isNewContract: false,
        existingContractAddress: CONTRACT,
      });

      expect(mockParseEventLogs).toHaveBeenCalledTimes(1);
    });
  });

  it('throws when isNewContract is false and no existingContractAddress', () => {
    mockParseEventLogs.mockReturnValueOnce([{ args: { tokenId: 1n } }] as any);

    expect(() =>
      parseMomentTransaction({ logs: LOGS, isNewContract: false })
    ).toThrow(
      'Expected contract.address when adding token to existing contract'
    );
  });

  it('throws when SetupNewToken event is absent from logs', () => {
    mockParseEventLogs.mockReturnValueOnce([] as any);

    expect(() =>
      parseMomentTransaction({
        logs: LOGS,
        isNewContract: false,
        existingContractAddress: CONTRACT,
      })
    ).toThrow('SetupNewToken event not found in transaction logs');
  });

  it('throws when SetupNewContract event is absent from logs for new contract', () => {
    mockParseEventLogs
      .mockReturnValueOnce([{ args: { tokenId: 1n } }] as any) // SetupNewToken present
      .mockReturnValueOnce([] as any); // SetupNewContract absent

    expect(() =>
      parseMomentTransaction({ logs: LOGS, isNewContract: true })
    ).toThrow('SetupNewContract event not found in transaction logs');
  });
});
