import getTelegramFilePath from './getTelegramFilePath';
import getMimeTypeFromFilePath from './getMimeTypeFromFilePath';

const fetchTelegramFile = async (
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string }> => {
  const token = process.env.TELEGRAM_CHAT_BOT_TOKEN;
  const filePath = await getTelegramFilePath(fileId);
  const mimeType = getMimeTypeFromFilePath(filePath);
  const res = await fetch(
    `https://api.telegram.org/file/bot${token}/${filePath}`
  );
  if (!res.ok)
    throw new Error(`Failed to fetch Telegram file: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), mimeType };
};

export default fetchTelegramFile;
