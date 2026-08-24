import type { Attachment } from 'chat';
import uploadFileToSupabase from '@/lib/supabase/storage/uploadFileToSupabase';
import uploadJsonToSupabase from '@/lib/supabase/storage/uploadJsonToSupabase';
import getTelegramFilePath from '@/lib/telegram/chat/attachment/getTelegramFilePath';
import getMimeTypeFromFilePath from '@/lib/telegram/chat/attachment/getMimeTypeFromFilePath';
import toFile from '@/lib/telegram/chat/attachment/toFile';

const uploadAudioAttachment = async (
  attachment: Attachment,
  fileId: string,
  name: string
) => {
  if (!attachment.fetchData) throw new Error('Attachment has no fetchData');

  const [buffer, filePath] = await Promise.all([
    attachment.fetchData(),
    getTelegramFilePath(fileId),
  ]);
  const mimeType = attachment.mimeType ?? getMimeTypeFromFilePath(filePath);

  const audioFile = toFile(buffer, name, mimeType);
  const audioUri = await uploadFileToSupabase(audioFile);

  const jsonObject = {
    name,
    animation_url: audioUri,
    content: { mime: mimeType, uri: audioUri },
  };
  const uri = await uploadJsonToSupabase(jsonObject);

  return { uri, mimeType, mediaUri: audioUri };
};

export default uploadAudioAttachment;
