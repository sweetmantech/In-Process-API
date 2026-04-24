/** Telegram inline button text max is 64 chars. */
const MAX = 64;

const truncateTelegramButtonLabel = (name: string) => {
  const t = name.trim();
  if (t.length <= MAX) return t || 'Untitled';
  return t.slice(0, MAX - 1) + '…';
};

export default truncateTelegramButtonLabel;
