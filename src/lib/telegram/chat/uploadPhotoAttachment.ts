import type { Attachment } from 'chat';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import { uploadJson } from '@/lib/arweave/uploadJson';
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
  const imageUri = await uploadToArweave(toFile(buffer, name, mimeType));
  const uri = await uploadJson({
    name,
    image: imageUri,
    content: { mime: mimeType, uri: imageUri },
  });

  return { uri, mimeType, mediaUri: imageUri };
};

export default uploadPhotoAttachment;
