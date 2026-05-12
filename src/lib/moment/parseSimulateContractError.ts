import { ContractFunctionExecutionError } from 'viem';

export function parseSimulateCallError(e: unknown): string {
  let cur: unknown = e;
  for (let i = 0; i < 10; i++) {
    if (cur instanceof ContractFunctionExecutionError) {
      return parseSimulateContractError(cur);
    }
    if (cur && typeof cur === 'object' && 'cause' in cur) {
      cur = (cur as { cause: unknown }).cause;
      continue;
    }
    break;
  }
  return (e as Error)?.message ?? 'Contract call simulation failed';
}

const ROLE_NAMES: Record<number, string> = {
  2: 'ADMIN',
  4: 'MINTER',
  8: 'SALES',
  16: 'METADATA',
  32: 'FUNDS_MANAGER',
};

export default function parseSimulateContractError(e: unknown): string {
  if (!(e instanceof ContractFunctionExecutionError)) {
    return (e as Error)?.message ?? 'simulateContract failed';
  }

  const revert = e.cause as any;
  const errorName: string = revert?.data?.errorName ?? revert?.errorName;
  const args: unknown[] = revert?.data?.args ?? [];

  if (errorName === 'UserMissingRoleForToken') {
    const [user, tokenId, role] = args as [string, bigint, bigint];
    const roleName = ROLE_NAMES[Number(role)] ?? `role(${role})`;
    const scope =
      tokenId === BigInt(0)
        ? 'contract level (tokenId=0)'
        : `tokenId=${tokenId}`;
    return `Contract simulation failed: account ${user} is missing the ${roleName} permission at ${scope}. Grant this permission before creating a moment on an existing contract.`;
  }

  if (errorName) {
    return `Contract simulation failed: ${errorName}(${args.join(', ')})`;
  }

  return e.shortMessage ?? e.message;
}
