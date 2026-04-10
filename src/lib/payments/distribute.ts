import type { Payments_t } from '@/types/envio';
import isSplitContract from '@/lib/splits/isSplitContract';
import type { Address } from 'viem';
import { distribute as splitDistribute } from '@/lib/splits/distribute';
import { getRetryDelay } from '@/lib/getRetryDelay';
import { isRateLimitError } from '@/lib/isRateLimitError';

export async function distribute(deposits: Payments_t[]) {
  const maxRetries = 3;
  const baseRetryDelay = 1000;
  let totalCnt = 0;

  for (const deposit of deposits) {
    const recipient = deposit.recipient;
    const isSplit = await isSplitContract(
      recipient as Address,
      deposit.chain_id
    );
    if (!isSplit) continue;

    let success = false;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await splitDistribute({
          splitAddress: deposit.recipient as Address,
          tokenAddress: deposit.currency as Address,
          chainId: deposit.chain_id,
        });
        console.log(
          `✅ Distribution completed: ${deposit.amount} ${deposit.currency} to ${recipient}`
        );
        totalCnt++;
        success = true;
        break;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = getRetryDelay(error, attempt, baseRetryDelay);
          const errorType = isRateLimitError(error)
            ? 'rate limit (429)'
            : 'error';
          console.warn(
            `⚠️ ${errorType} distributing to ${recipient} (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        console.error(
          `❌ Failed distributing to ${recipient} after ${maxRetries + 1} attempts:`,
          lastError
        );
      }
    }
    void success; // suppress unused variable warning
  }

  if (totalCnt > 0)
    console.log(`✅ Successfully distributed ${totalCnt} payment(s)`);
}
