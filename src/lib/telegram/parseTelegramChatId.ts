// Converts chat library channelId ("telegram:123456" or "telegram:123456:789") to the raw
// numeric chat ID required by the Telegram Bot API.
const parseTelegramChatId = (channelId: string): string =>
  channelId.replace(/^telegram:/, '').split(':')[0];

export default parseTelegramChatId;
