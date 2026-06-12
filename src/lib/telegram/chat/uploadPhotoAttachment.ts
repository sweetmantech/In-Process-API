import type { Attachment } from 'chat';
import uploadFileToSupabase from '@/lib/supabase/storage/uploadFileToSupabase';
import uploadJsonToSupabase from '@/lib/supabase/storage/uploadJsonToSupabase';
import getTelegramFilePath from './getTelegramFilePath';
import getMimeTypeFromFilePath from './getMimeTypeFromFilePath';
import toFile from './toFile';

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
  const mimeType = attachment.mimeType ?? getMimeTypeFromFilePath(filePath);
  const photoFile = toFile(buffer, name, mimeType);
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
