import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import createMomentBatch, {
  type CreateMomentBatchInput,
  type CreateMomentBatchResult,
} from '@/lib/moment/createMomentBatch';
import isNonceRetryableError from '@/lib/coinbase/isNonceRetryableError';

const NONCE_RETRY_DELAY_MS = 5_000;
const MAX_ATTEMPTS = 3;

const mintWithNonceRetry = async (
  thread: Thread<TelegramThreadState>,
  batchInput: CreateMomentBatchInput
): Promise<CreateMomentBatchResult> => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await createMomentBatch(batchInput);
    } catch (error) {
      if (!isNonceRetryableError(error) || attempt >= MAX_ATTEMPTS) throw error;
      if (attempt === 1) {
        await thread.post(
          "Network's busy right now, so minting is taking a bit longer. Retrying now..."
        );
      }
      await new Promise((resolve) => setTimeout(resolve, NONCE_RETRY_DELAY_MS));
    }
  }
};

export default mintWithNonceRetry;
