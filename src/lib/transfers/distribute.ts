import isSplitContract from '@/lib/splits/isSplitContract';
import { distribute as splitDistribute } from '@/lib/splits/distribute';
import { getRetryDelay } from '@/lib/getRetryDelay';
import { isRateLimitError } from '@/lib/isRateLimitError';
import sleep from '@/lib/sleep';
import type { Transfers_t } from '@/types/envio';
import type { Address } from 'viem';
import { zeroAddress } from 'viem';

export async function distribute(transfers: Transfers_t[]) {
  const maxRetries = 3;
  const baseRetryDelay = 1000;
  let totalCnt = 0;

  for (const transfer of transfers) {
    if (!transfer.value || BigInt(transfer.value) <= BigInt(0)) continue;

    const recipient = transfer.recipient;
    const isSplit = await isSplitContract(
      recipient as Address,
      transfer.chain_id
    );
    if (!isSplit) continue;

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const hash = await splitDistribute({
          splitAddress: recipient as Address,
          tokenAddress: (transfer.currency ?? zeroAddress) as Address,
          chainId: transfer.chain_id,
        });
        console.log(
          `✅ Distribution completed: ${transfer.value} ${transfer.currency ?? zeroAddress} to ${recipient} (tx: ${hash})`
        );
        totalCnt++;
        break;
      } catch (error) {
        lastError = error;
        const isRateLimit = isRateLimitError(error);

        if (attempt < maxRetries) {
          const delay = getRetryDelay(error, attempt, baseRetryDelay);
          const errorType = isRateLimit ? 'rate limit (429)' : 'error';
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.warn(
            `⚠️ ${errorType} distributing ${transfer.value} ${transfer.currency ?? zeroAddress} to ${recipient} (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`,
            errorMessage
          );
          await sleep(delay);
          continue;
        }

        const errorType = isRateLimit ? 'rate limit (429)' : 'error';
        console.error(
          `❌ ${errorType} distributing ${transfer.value} ${transfer.currency ?? zeroAddress} to ${recipient} after ${maxRetries + 1} attempts:`,
          lastError
        );
      }
    }
  }

  if (totalCnt > 0) {
    console.log(`✅ Successfully distributed ${totalCnt} split payout(s)`);
  }
}
