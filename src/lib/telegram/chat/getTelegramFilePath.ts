import fileIdSchema from './fileIdSchema';

const getTelegramFilePath = async (fileId: string): Promise<string> => {
  fileIdSchema.parse(fileId);

  const token = process.env.TELEGRAM_CHAT_BOT_TOKEN;
  if (!token)
    throw new Error('getTelegramFilePath: TELEGRAM_CHAT_BOT_TOKEN is not set');

  const res = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `getTelegramFilePath: request failed with status ${res.status}: ${text}`
    );
  }

  const data = await res.json();
  const filePath = data.result?.file_path;
  if (!filePath)
    throw new Error('getTelegramFilePath: file_path missing from response');

  return filePath;
};

export default getTelegramFilePath;
