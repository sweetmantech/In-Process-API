import { describe, it, expect } from 'vitest';
import { ContractFunctionExecutionError } from 'viem';
import parseSimulateContractError from '@/lib/moment/parseSimulateContractError';

const USER = '0x58736a1AC6c970de7ECe12eB8A44b02e4b63EC54';

function makeContractError({
  errorName,
  args = [],
  shortMessage,
  message = 'Contract function reverted',
}: {
  errorName?: string;
  args?: unknown[];
  shortMessage?: string;
  message?: string;
}): ContractFunctionExecutionError {
  const err = Object.create(ContractFunctionExecutionError.prototype);
  err.message = message;
  err.shortMessage = shortMessage;
  err.cause = { data: { errorName, args } };
  return err;
}

describe('parseSimulateContractError', () => {
  describe('non-ContractFunctionExecutionError', () => {
    it('returns message for plain Error', () => {
      const result = parseSimulateContractError(new Error('network timeout'));
      expect(result).toBe('network timeout');
    });
    it('returns fallback when no message', () => {
      const result = parseSimulateContractError({});
      expect(result).toBe('simulateContract failed');
    });
    it('returns fallback for string input', () => {
      const result = parseSimulateContractError('something went wrong');
      expect(result).toBe('simulateContract failed');
    });
  });

  describe('UserMissingRoleForToken', () => {
    it('tokenId=0 + role=4(MINTER) → contract level MINTER message', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(4)],
      });
      expect(parseSimulateContractError(err)).toBe(
        `Contract simulation failed: account ${USER} is missing the MINTER permission at contract level (tokenId=0). Grant this permission before creating a moment on an existing contract.`
      );
    });
    it('tokenId=0 + role=2(ADMIN)', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(2)],
      });
      expect(parseSimulateContractError(err)).toContain('ADMIN');
    });
    it('tokenId=0 + role=8(SALES)', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(8)],
      });
      expect(parseSimulateContractError(err)).toContain('SALES');
    });
    it('tokenId=0 + role=16(METADATA)', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(16)],
      });
      expect(parseSimulateContractError(err)).toContain('METADATA');
    });
    it('tokenId=0 + role=32(FUNDS_MANAGER)', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(32)],
      });
      expect(parseSimulateContractError(err)).toContain('FUNDS_MANAGER');
    });
    it('tokenId != 0 returns tokenId=N scope', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(3), BigInt(4)],
      });
      expect(parseSimulateContractError(err)).toContain('tokenId=3');
      expect(parseSimulateContractError(err)).not.toContain('contract level');
    });
    it('unknown role number shown as role(N)', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(99)],
      });
      expect(parseSimulateContractError(err)).toContain('role(99)');
    });
  });

  describe('other named contract errors', () => {
    it('returns errorName with args', () => {
      const err = makeContractError({
        errorName: 'InvalidTokenId',
        args: [BigInt(5)],
      });
      expect(parseSimulateContractError(err)).toBe(
        'Contract simulation failed: InvalidTokenId(5)'
      );
    });
    it('returns errorName with no args', () => {
      const err = makeContractError({ errorName: 'Unauthorized' });
      expect(parseSimulateContractError(err)).toBe(
        'Contract simulation failed: Unauthorized()'
      );
    });
  });

  describe('ContractFunctionExecutionError without errorName', () => {
    it('returns shortMessage if present', () => {
      const err = makeContractError({ shortMessage: 'execution reverted' });
      expect(parseSimulateContractError(err)).toBe('execution reverted');
    });
    it('falls back to message', () => {
      const err = makeContractError({ message: 'raw error message' });
      expect(parseSimulateContractError(err)).toBe('raw error message');
    });
  });
});
