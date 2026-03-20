import type { Attachment } from 'chat';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import { uploadJson } from '@/lib/arweave/uploadJson';
import uploadVideoToMux from '@/lib/mux/uploadVideoToMux';
import getTelegramFilePath from './getTelegramFilePath';
import getMimeTypeFromFilePath from './getMimeTypeFromFilePath';
import fetchTelegramFile from './fetchTelegramFile';
import toFile from './toFile';

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

  console.log('mux uploaded', playbackUrl, downloadUrl);
  const imageUri = thumbResult
    ? await uploadToArweave(
        toFile(thumbResult.buffer, `${name}-thumb`, thumbResult.mimeType)
      )
    : '';

  const uri = await uploadJson({
    name,
    ...(imageUri && { image: imageUri }),
    animation_url: playbackUrl,
    content: { mime: mimeType, uri: downloadUrl || playbackUrl },
  });

  return { uri, mimeType, mediaUri: playbackUrl };
};

export default uploadVideoAttachment;
