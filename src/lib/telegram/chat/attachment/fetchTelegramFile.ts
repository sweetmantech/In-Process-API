import getTelegramFilePath from './getTelegramFilePath';
import resolveTelegramFileMimeType from './resolveTelegramFileMimeType';

const fetchTelegramFile = async (
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string }> => {
  const token = process.env.TELEGRAM_CHAT_BOT_TOKEN;
  const filePath = await getTelegramFilePath(fileId);
  const res = await fetch(
    `https://api.telegram.org/file/bot${token}/${filePath}`
  );
  if (!res.ok)
    throw new Error(`Failed to fetch Telegram file: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = resolveTelegramFileMimeType(filePath, buffer);
  return { buffer, mimeType };
};

export default fetchTelegramFile;
