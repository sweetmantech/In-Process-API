import { logMessage } from '@/lib/messages/logMessage';
import { SHORT_CHAIN_NAME, SITE_ORIGINAL_URL } from '@/lib/consts';
import selectChatId from '@/lib/supabase/in_process_messages/selectChatId';
import type { Transfers_t } from '@/types/envio';
import { telegramChatBotClient } from '@/lib/telegram/client';
import { trimMessage } from '@/lib/telegram/trimMessage';

/** One Telegram per airdrop transfer in `batch` (`value` and `currency` not both set). */
const notifyAirdrop = async (batch: Transfers_t[]): Promise<void> => {
  for (const t of batch) {
    if (t.value && t.currency) continue;
    const recipient = t.recipient.toLowerCase();
    try {
      const chatId = await selectChatId(recipient);
      if (!chatId) {
        console.log(
          `ℹ️  No Telegram chat for recipient ${recipient}; skipping airdrop notification`
        );
        continue;
      }

      const text = trimMessage(
        `You received a new moment on In Process. \n\n${SITE_ORIGINAL_URL}/collect/${SHORT_CHAIN_NAME[t.chain_id] ?? 'base'}:${t.collection.toLowerCase()}/${t.token_id}`
      );

      await telegramChatBotClient.sendMessage(chatId, text);
      await logMessage(
        [{ type: 'text', text }],
        'assistant',
        chatId,
        recipient,
        'telegram'
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(
        `❌ notifyAirdrop failed (recipient ${recipient}, transfer ${t.id}):`,
        msg
      );
    }
  }
};

export default notifyAirdrop;
