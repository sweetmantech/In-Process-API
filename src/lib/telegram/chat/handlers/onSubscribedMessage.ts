import type { Thread, Attachment } from 'chat';
import type { TelegramChatBot } from '../bot';
import type { TelegramThreadState } from '../telegramThreadState';
import processTelegramMedia from '../processTelegramMedia';
import fetchTelegramFile from '../fetchTelegramFile';

export function registerOnSubscribedMessage(bot: TelegramChatBot) {
  bot.onSubscribedMessage(async (rawThread, message) => {
    const thread = rawThread as Thread<TelegramThreadState>;
    try {
      const state = await thread.state;
      const pending = state?.pendingMedia;
      if (!pending) return;

      const text = message.text?.trim() ?? '';
      const attachment = message.attachments?.[0];

      if (
        attachment &&
        (attachment.type === 'image' || attachment.type === 'video')
      ) {
        // New media sent instead of title — clear pending and let onDirectMessage handle it
        await thread.setState({ pendingMedia: null });
        await thread.unsubscribe();
        return;
      }

      if (!text) {
        await thread.post(
          '📝 Please send the title as text (not a photo or video).'
        );
        return;
      }

      // Title received — process the pending media
      await thread.setState({ pendingMedia: null });
      await thread.unsubscribe();
      await thread.post(
        '⏳ In Process will post your moment. Please wait a few seconds...'
      );
      const pendingAttachment: Attachment = {
        type: pending.attachmentType,
        size: pending.attachmentSize,
        fetchData: () =>
          fetchTelegramFile(pending.fileId).then((r) => r.buffer),
      };
      await processTelegramMedia(
        thread,
        pendingAttachment,
        pending.fileId,
        text,
        pending.artistAddress,
        pending.thumbFileId
      );
    } catch (error) {
      console.error('[telegram-subscribed] onSubscribedMessage error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong.';
      await thread.post(`❌ ${errorMessage}`);
    }
  });
}
