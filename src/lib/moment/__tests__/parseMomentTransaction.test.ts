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

  describe('when existingContractAddress is provided', () => {
    beforeEach(() => {
      mockParseEventLogs.mockReturnValueOnce([
        { args: { tokenId: 3n } },
      ] as any); // SetupNewToken
    });

    it('extracts tokenId as string from SetupNewToken event', () => {
      const { tokenId } = parseMomentTransaction({
        logs: LOGS,
        existingContractAddress: CONTRACT,
      });

      expect(tokenId).toBe('3');
    });

    it('uses the existing contract address', () => {
      const { contractAddress } = parseMomentTransaction({
        logs: LOGS,
        existingContractAddress: CONTRACT,
      });

      expect(contractAddress).toBe(CONTRACT);
    });

    it('only parses SetupNewToken logs', () => {
      parseMomentTransaction({
        logs: LOGS,
        existingContractAddress: CONTRACT,
      });

      expect(mockParseEventLogs).toHaveBeenCalledTimes(1);
    });
  });

  describe('when existingContractAddress is omitted', () => {
    beforeEach(() => {
      mockParseEventLogs
        .mockReturnValueOnce([{ args: { tokenId: 5n } }] as any) // SetupNewToken
        .mockReturnValueOnce([{ args: { newContract: NEW_CONTRACT } }] as any); // SetupNewContract
    });

    it('extracts tokenId as string from SetupNewToken event', () => {
      const { tokenId } = parseMomentTransaction({ logs: LOGS });

      expect(tokenId).toBe('5');
    });

    it('extracts contractAddress from SetupNewContract event', () => {
      const { contractAddress } = parseMomentTransaction({ logs: LOGS });

      expect(contractAddress).toBe(NEW_CONTRACT);
    });

    it('calls parseEventLogs twice (token setup then factory)', () => {
      parseMomentTransaction({ logs: LOGS });

      expect(mockParseEventLogs).toHaveBeenCalledTimes(2);
    });
  });

  it('throws when SetupNewToken event is absent from logs', () => {
    mockParseEventLogs.mockReturnValueOnce([] as any);

    expect(() =>
      parseMomentTransaction({
        logs: LOGS,
        existingContractAddress: CONTRACT,
      })
    ).toThrow('SetupNewToken event not found in transaction logs');
  });

  it('throws when SetupNewContract event is absent for a new contract', () => {
    mockParseEventLogs
      .mockReturnValueOnce([{ args: { tokenId: 1n } }] as any) // SetupNewToken present
      .mockReturnValueOnce([] as any); // SetupNewContract absent

    expect(() =>
      parseMomentTransaction({
        logs: LOGS,
      })
    ).toThrow('SetupNewContract event not found in transaction logs');
  });
});
