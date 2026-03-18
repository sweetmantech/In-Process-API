import { describe, it, expect } from 'vitest';
import { ContractFunctionExecutionError } from 'viem';
import parseSimulateContractError from '@/lib/moment/parseSimulateContractError';

const USER = '0x58736a1AC6c970de7ECe12eB8A44b02e4b63EC54';

/**
 * ContractFunctionExecutionError의 생성자는 복잡하므로
 * prototype 기반으로 필요한 프로퍼티만 주입해 instanceof 검사를 통과시킨다.
 */
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
    it('일반 Error는 message를 반환한다', () => {
      const result = parseSimulateContractError(new Error('network timeout'));
      expect(result).toBe('network timeout');
    });

    it('message가 없는 경우 fallback 문자열을 반환한다', () => {
      const result = parseSimulateContractError({});
      expect(result).toBe('simulateContract failed');
    });

    it('문자열을 넘기면 message가 undefined이므로 fallback을 반환한다', () => {
      const result = parseSimulateContractError('something went wrong');
      expect(result).toBe('simulateContract failed');
    });
  });

  describe('UserMissingRoleForToken', () => {
    it('tokenId=0 + role=4(MINTER) → contract level MINTER 메시지를 반환한다', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(4)],
      });
      expect(parseSimulateContractError(err)).toBe(
        `Contract simulation failed: account ${USER} is missing the MINTER permission at contract level (tokenId=0). Grant this permission before creating a moment on an existing contract.`
      );
    });

    it('tokenId=0 + role=2(ADMIN) → ADMIN 역할명을 반환한다', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(2)],
      });
      expect(parseSimulateContractError(err)).toContain('ADMIN');
    });

    it('tokenId=0 + role=8(SALES) → SALES 역할명을 반환한다', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(8)],
      });
      expect(parseSimulateContractError(err)).toContain('SALES');
    });

    it('tokenId=0 + role=16(METADATA) → METADATA 역할명을 반환한다', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(16)],
      });
      expect(parseSimulateContractError(err)).toContain('METADATA');
    });

    it('tokenId=0 + role=32(FUNDS_MANAGER) → FUNDS_MANAGER 역할명을 반환한다', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(32)],
      });
      expect(parseSimulateContractError(err)).toContain('FUNDS_MANAGER');
    });

    it('tokenId=0 이 아닌 경우 tokenId=N 스코프를 반환한다', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(3), BigInt(4)],
      });
      expect(parseSimulateContractError(err)).toContain('tokenId=3');
      expect(parseSimulateContractError(err)).not.toContain('contract level');
    });

    it('알 수 없는 role 번호는 role(N) 형태로 표시한다', () => {
      const err = makeContractError({
        errorName: 'UserMissingRoleForToken',
        args: [USER, BigInt(0), BigInt(99)],
      });
      expect(parseSimulateContractError(err)).toContain('role(99)');
    });
  });

  describe('기타 named 컨트랙 에러', () => {
    it('errorName과 args를 포함한 메시지를 반환한다', () => {
      const err = makeContractError({
        errorName: 'InvalidTokenId',
        args: [BigInt(5)],
      });
      expect(parseSimulateContractError(err)).toBe(
        'Contract simulation failed: InvalidTokenId(5)'
      );
    });

    it('args가 없어도 errorName만으로 메시지를 반환한다', () => {
      const err = makeContractError({ errorName: 'Unauthorized' });
      expect(parseSimulateContractError(err)).toBe(
        'Contract simulation failed: Unauthorized()'
      );
    });
  });

  describe('errorName이 없는 ContractFunctionExecutionError', () => {
    it('shortMessage가 있으면 shortMessage를 반환한다', () => {
      const err = makeContractError({ shortMessage: 'execution reverted' });
      expect(parseSimulateContractError(err)).toBe('execution reverted');
    });

    it('shortMessage도 없으면 message를 반환한다', () => {
      const err = makeContractError({ message: 'raw error message' });
      expect(parseSimulateContractError(err)).toBe('raw error message');
    });
  });
});
