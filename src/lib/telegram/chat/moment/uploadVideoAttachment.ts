import type { Attachment } from 'chat';
import uploadFileToSupabase from '@/lib/supabase/storage/uploadFileToSupabase';
import uploadJsonToSupabase from '@/lib/supabase/storage/uploadJsonToSupabase';
import uploadVideoToMux from '@/lib/mux/uploadVideoToMux';
import getTelegramFilePath from '@/lib/telegram/chat/attachment/getTelegramFilePath';
import getMimeTypeFromFilePath from '@/lib/telegram/chat/attachment/getMimeTypeFromFilePath';
import fetchTelegramFile from '@/lib/telegram/chat/attachment/fetchTelegramFile';
import toFile from '@/lib/telegram/chat/attachment/toFile';

const uploadVideoAttachment = async (
  attachment: Attachment,
  fileId: string,
  name: string,
  thumbFileId?: string
) => {
  if (!attachment.fetchData) throw new Error('Attachment has no fetchData');

  const [buffer, filePath] = await Promise.all([
    attachment.fetchData(),
    getTelegramFilePath(fileId),
  ]);
  const mimeType = attachment.mimeType ?? getMimeTypeFromFilePath(filePath);

  const [{ playbackUrl, downloadUrl }, thumbResult] = await Promise.all([
    uploadVideoToMux(buffer, mimeType),
    thumbFileId ? fetchTelegramFile(thumbFileId) : Promise.resolve(null),
  ]);

  let imageUri = '';
  if (thumbResult) {
    const thumbFile = toFile(
      thumbResult.buffer,
      `${name}-thumb`,
      thumbResult.mimeType
    );
    imageUri = await uploadFileToSupabase(thumbFile);
  }

  const jsonObject = {
    name,
    ...(imageUri && { image: imageUri }),
    animation_url: playbackUrl,
    content: { mime: mimeType, uri: downloadUrl || playbackUrl },
  };
  const uri = await uploadJsonToSupabase(jsonObject);

  return { uri, mimeType, mediaUri: playbackUrl };
};

export default uploadVideoAttachment;
