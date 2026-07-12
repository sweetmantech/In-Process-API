import type { Attachment } from 'chat';
import uploadFileToSupabase from '@/lib/supabase/storage/uploadFileToSupabase';
import uploadJsonToSupabase from '@/lib/supabase/storage/uploadJsonToSupabase';
import uploadVideoToMux from '@/lib/mux/uploadVideoToMux';
import getTelegramFilePath from '@/lib/telegram/chat/attachment/getTelegramFilePath';
import getMimeTypeFromFilePath from '@/lib/telegram/chat/attachment/getMimeTypeFromFilePath';
import fetchTelegramFile from '@/lib/telegram/chat/attachment/fetchTelegramFile';
import toFile from '@/lib/telegram/chat/attachment/toFile';
import readMp4VideoRotationDegrees from '@/lib/media/readMp4VideoRotationDegrees';
import rotateImageBuffer from '@/lib/media/rotateImageBuffer';

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
  // Telegram's own thumbnail for a video sent as a document is a raw frame
  // grab that ignores the container's display-rotation matrix, so correct
  // it ourselves before storing it as the token's preview image.
  const rotationDegrees = readMp4VideoRotationDegrees(buffer);

  const [{ playbackUrl, downloadUrl }, thumbResult] = await Promise.all([
    uploadVideoToMux(buffer, mimeType),
    thumbFileId ? fetchTelegramFile(thumbFileId) : Promise.resolve(null),
  ]);

  let imageUri = '';
  if (thumbResult) {
    const thumbBuffer = rotationDegrees
      ? await rotateImageBuffer(thumbResult.buffer, rotationDegrees)
      : thumbResult.buffer;
    const thumbFile = toFile(
      thumbBuffer,
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
