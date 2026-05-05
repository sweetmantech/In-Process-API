import type { Attachment } from 'chat';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import { uploadJson } from '@/lib/arweave/uploadJson';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import uploadVideoToMux from '@/lib/mux/uploadVideoToMux';
import getTelegramFilePath from './getTelegramFilePath';
import getMimeTypeFromFilePath from './getMimeTypeFromFilePath';
import fetchTelegramFile from './fetchTelegramFile';
import toFile from './toFile';

const uploadVideoAttachment = async (
  attachment: Attachment,
  fileId: string,
  name: string,
  artistAddress: string,
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
    const thumbUpload = await uploadToArweave(thumbFile);
    logArweaveUpload(thumbUpload, {
      file_size_bytes: thumbResult.buffer.byteLength,
      content_type: thumbResult.mimeType,
      artist_address: artistAddress,
    });
    imageUri = thumbUpload.arweave_uri;
  }

  const jsonObject = {
    name,
    ...(imageUri && { image: imageUri }),
    animation_url: playbackUrl,
    content: { mime: mimeType, uri: downloadUrl || playbackUrl },
  };
  const jsonResult = await uploadJson(jsonObject);
  logArweaveUpload(jsonResult, {
    file_size_bytes: Buffer.byteLength(JSON.stringify(jsonObject)),
    content_type: 'application/json',
    artist_address: artistAddress,
  });

  return { uri: jsonResult.arweave_uri, mimeType, mediaUri: playbackUrl };
};

export default uploadVideoAttachment;
