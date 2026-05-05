import type { Attachment } from 'chat';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import { uploadJson } from '@/lib/arweave/uploadJson';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import getTelegramFilePath from './getTelegramFilePath';
import getMimeTypeFromFilePath from './getMimeTypeFromFilePath';
import toFile from './toFile';

const uploadPhotoAttachment = async (
  attachment: Attachment,
  fileId: string,
  name: string,
  artistAddress: string
) => {
  if (!attachment.fetchData) throw new Error('Attachment has no fetchData');

  const [buffer, filePath] = await Promise.all([
    attachment.fetchData(),
    getTelegramFilePath(fileId),
  ]);
  const mimeType = attachment.mimeType ?? getMimeTypeFromFilePath(filePath);
  const photoFile = toFile(buffer, name, mimeType);
  const photoResult = await uploadToArweave(photoFile);
  logArweaveUpload(photoResult, {
    file_size_bytes: buffer.byteLength,
    content_type: mimeType,
    artist_address: artistAddress,
  });

  const jsonObject = {
    name,
    image: photoResult.arweave_uri,
    content: { mime: mimeType, uri: photoResult.arweave_uri },
  };
  const jsonResult = await uploadJson(jsonObject);
  logArweaveUpload(jsonResult, {
    file_size_bytes: Buffer.byteLength(JSON.stringify(jsonObject)),
    content_type: 'application/json',
    artist_address: artistAddress,
  });

  return {
    uri: jsonResult.arweave_uri,
    mimeType,
    mediaUri: photoResult.arweave_uri,
  };
};

export default uploadPhotoAttachment;
