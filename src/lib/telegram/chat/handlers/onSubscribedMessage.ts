import type { Thread, Attachment } from 'chat';
import type { TelegramChatBot } from '../bot';
import type { TelegramThreadState } from '../telegramThreadState';
import processTelegramMedia from '../processTelegramMedia';
import fetchTelegramFile from '../fetchTelegramFile';
import handleTelegramMedia from '../handleTelegramMedia';

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
        // New media sent instead of title — replace pending and process the new media
        await thread.setState({ pendingMedia: null });
        await thread.unsubscribe();
        await handleTelegramMedia(
          thread,
          message,
          attachment,
          text,
          pending.artistAddress
        );
        return;
      }

      if (!text) {
        await thread.post(
          '📝 Please send the title as text (not a photo or video).'
        );
        return;
      }

      // Title received — process the pending media
      await thread.post(
        '⏳ In Process will post your moment. Please wait a few seconds...'
      );
      const pendingAttachment: Attachment = {
        type: pending.attachmentType,
        size: pending.attachmentSize,
        fetchData: () =>
          fetchTelegramFile(pending.fileId).then((r) => r.buffer),
      };
      await thread.startTyping();
      const typingInterval = setInterval(() => void thread.startTyping(), 4000);
      try {
        await processTelegramMedia(
          thread,
          pendingAttachment,
          pending.fileId,
          text,
          pending.artistAddress,
          pending.thumbFileId
        );
      } finally {
        clearInterval(typingInterval);
      }
      // Only clear pending state after successful processing
      await thread.setState({ pendingMedia: null });
      await thread.unsubscribe();
    } catch (error) {
      console.error('[telegram-subscribed] onSubscribedMessage error:', error);
      await thread.post(
        '❌ An unexpected error occurred. Please try again later.'
      );
    }
  });
}
