import { tasks } from '@trigger.dev/sdk';
import type { Address } from 'viem';
import type { TelegramChatBot } from '../bot';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import uploadTelegramAttachment from '../uploadTelegramAttachment';
import createMomentFromTelegramAttachment from '../createMomentFromTelegramAttachment';
import { logMessage } from '@/lib/messages/logMessage';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';

type PendingMedia = {
  uri: string;
  mimeType: string;
};

type BotState = {
  pendingMedia?: PendingMedia;
};

export function registerOnDirectMessage(bot: TelegramChatBot) {
  bot.onDirectMessage(async (thread, message) => {
    try {
      const telegramUsername = message.author.userName;
      if (!telegramUsername) return;

      const { data } = await selectArtists({
        telegram_username: telegramUsername,
      });
      const artist = data?.[0] ?? null;

      if (!artist) {
        await thread.post(
          'Welcome to In Process! To get started please visit https://inprocess.world/manage and link your telegram account.'
        );
        return;
      }

      const artistAddress = artist.address as Address;
      const text = message.text?.trim() ?? '';

      if (text === '/start') {
        await thread.post(
          `Hello ${artist.username || telegramUsername}, welcome to In Process! Your telegram has been verified! You can now send photos and captions to post them on In Process.`
        );
        return;
      }

      // Check for pending media awaiting a title
      const state = ((await thread.state) ?? {}) as BotState;
      if (state.pendingMedia && text) {
        await thread.post(
          '⏳ In Process will post your moment. Please wait a few seconds...'
        );
        const { contractAddress, tokenId } =
          await createMomentFromTelegramAttachment({
            uri: state.pendingMedia.uri,
            name: text,
            artistAddress,
          });
        await thread.setState({ pendingMedia: undefined });
        await handleMomentSuccess(
          thread,
          contractAddress.toString(),
          tokenId,
          artistAddress
        );
        return;
      }

      // Handle new attachment
      const attachment = message.attachments?.[0];
      if (
        attachment &&
        (attachment.type === 'image' || attachment.type === 'video')
      ) {
        const name = text || `moment-${Date.now()}`;
        const uploaded = await uploadTelegramAttachment(attachment, name);

        await logMessage(
          [{ type: 'text', text }],
          'user',
          artistAddress,
          'telegram'
        );

        if (text) {
          await thread.post(
            '⏳ In Process will post your moment. Please wait a few seconds...'
          );
          const { contractAddress, tokenId } =
            await createMomentFromTelegramAttachment({
              uri: uploaded.uri,
              name,
              artistAddress,
            });
          await handleMomentSuccess(
            thread,
            contractAddress.toString(),
            tokenId,
            artistAddress
          );
        } else {
          await thread.setState({
            pendingMedia: { uri: uploaded.uri, mimeType: uploaded.mimeType },
          });
          await thread.post('📝 Please send the title for your moment:');
        }
      } else {
        await thread.post(
          'Please send a photo or video with a caption or text.'
        );
      }
    } catch (error) {
      console.error('[telegram-dm] onDirectMessage error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong.';
      await thread.post(`❌ ${errorMessage}`);
    }
  });
}

async function handleMomentSuccess(
  thread: Parameters<Parameters<TelegramChatBot['onDirectMessage']>[0]>[0],
  contractAddress: string,
  tokenId: string,
  artistAddress: string
) {
  const chain = IS_TESTNET ? 'bsep' : 'base';
  const successMessage = `✅ Moment created! ${SITE_ORIGINAL_URL}/sms/${chain}:${contractAddress}/${tokenId}`;

  const messageId = await logMessage(
    [{ type: 'text', text: successMessage }],
    'assistant',
    artistAddress,
    'telegram'
  );

  if (messageId) {
    await tasks.trigger('process-message-moment', { messageId });
  }

  await thread.post(successMessage);
}
