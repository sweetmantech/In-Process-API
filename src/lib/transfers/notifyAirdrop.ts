import { logMessage } from '@/lib/messages/logMessage';
import { SHORT_CHAIN_NAME, SITE_ORIGINAL_URL } from '@/lib/consts';
import selectMessage from '@/lib/supabase/in_process_messages/selectMessage';
import type { Transfers_t } from '@/types/envio';
import { telegramChatBotClient } from '@/lib/telegram/client';
import getAirdropOperator from './getAirdropOperator';
import type { Hex } from 'viem';
import truncateAddress from '@/lib/truncateAddress';

/** One Telegram per airdrop transfer in `batch` (`value` and `currency` not both set). */
const notifyAirdrop = async (batch: Transfers_t[]): Promise<void> => {
  for (const t of batch) {
    if (t.value && t.currency) continue;
    const recipient = t.recipient.toLowerCase();
    try {
      const { error, data } = await selectMessage(recipient);
      const chatId = data?.chat_id;
      if (error || !chatId) continue;

      const { address, username } = await getAirdropOperator(
        t.transaction_hash as Hex,
        t.chain_id,
        t.collection
      );

      if (!address && !username) continue;
      const text = `${username || truncateAddress(address)} airdropped a moment on In Process. \n\n${SITE_ORIGINAL_URL}/collect/${SHORT_CHAIN_NAME[t.chain_id] ?? 'base'}:${t.collection.toLowerCase()}/${t.token_id}`;

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
