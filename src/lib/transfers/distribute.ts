import isSplitContract from '@/lib/splits/isSplitContract';
import { distribute as splitDistribute } from '@/lib/splits/distribute';
import { retriesGeneric } from '@/lib/protocolSdk/retries';
import type { Transfers_t } from '@/types/envio';
import type { Address } from 'viem';
import { zeroAddress } from 'viem';

export async function distribute(transfers: Transfers_t[]) {
  let totalCnt = 0;

  for (const transfer of transfers) {
    if (!transfer.value || BigInt(transfer.value) <= BigInt(0)) continue;

    const recipient = transfer.recipient;
    const isSplit = await isSplitContract(
      recipient as Address,
      transfer.chain_id
    );
    if (!isSplit) continue;

    try {
      await retriesGeneric({
        maxTries: 3,
        linearBackoffMS: 1000,
        tryFn: async () => {
          const hash = await splitDistribute({
            splitAddress: recipient as Address,
            tokenAddress: (transfer.currency ?? zeroAddress) as Address,
            chainId: transfer.chain_id,
          });
          console.log(
            `✅ Distribution completed: ${transfer.value} ${transfer.currency ?? zeroAddress} to ${recipient} (tx: ${hash})`
          );
          totalCnt++;
          return hash;
        },
      });
    } catch (lastError) {
      console.error(
        `❌ Error distributing ${transfer.value} ${transfer.currency ?? zeroAddress} to ${recipient}`,
        lastError
      );
    }
  }

  if (totalCnt > 0) {
    console.log(`✅ Successfully distributed ${totalCnt} split payout(s)`);
  }
}
