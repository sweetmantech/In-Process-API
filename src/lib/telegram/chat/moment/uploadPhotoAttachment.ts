import type { Attachment } from 'chat';
import uploadFileToSupabase from '@/lib/supabase/storage/uploadFileToSupabase';
import uploadJsonToSupabase from '@/lib/supabase/storage/uploadJsonToSupabase';
import prepareImageBufferForSharp from '@/lib/media/prepareImageBufferForSharp';
import isHeicBuffer from '@/lib/media/isHeicBuffer';
import getTelegramFilePath from '@/lib/telegram/chat/attachment/getTelegramFilePath';
import getMimeTypeFromFilePath from '@/lib/telegram/chat/attachment/getMimeTypeFromFilePath';
import toFile from '@/lib/telegram/chat/attachment/toFile';

const uploadPhotoAttachment = async (
  attachment: Attachment,
  fileId: string,
  name: string
) => {
  if (!attachment.fetchData) throw new Error('Attachment has no fetchData');

  const [buffer, filePath] = await Promise.all([
    attachment.fetchData(),
    getTelegramFilePath(fileId),
  ]);
  let mimeType = attachment.mimeType ?? getMimeTypeFromFilePath(filePath);
  let uploadBuffer = buffer;

  if (isHeicBuffer(buffer)) {
    uploadBuffer = await prepareImageBufferForSharp(buffer);
    mimeType = 'image/jpeg';
  }

  const photoFile = toFile(uploadBuffer, name, mimeType);
  const photoUri = await uploadFileToSupabase(photoFile);

  const jsonObject = {
    name,
    image: photoUri,
    content: { mime: mimeType, uri: photoUri },
  };
  const uri = await uploadJsonToSupabase(jsonObject);

  return { uri, mimeType, mediaUri: photoUri };
};

export default uploadPhotoAttachment;
