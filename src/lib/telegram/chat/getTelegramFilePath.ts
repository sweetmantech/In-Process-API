const getTelegramFilePath = async (fileId: string): Promise<string> => {
  const token = process.env.TELEGRAM_CHAT_BOT_TOKEN;
  const res = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
  );
  const data = await res.json();
  return data.result?.file_path ?? '';
};

export default getTelegramFilePath;
