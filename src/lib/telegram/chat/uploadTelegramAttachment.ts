import type { Attachment } from 'chat';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import { uploadJson } from '@/lib/arweave/uploadJson';

const uploadTelegramAttachment = async (
  attachment: Attachment,
  name: string
) => {
  if (!attachment.fetchData) throw new Error('Attachment has no fetchData');

  const buffer = await attachment.fetchData();
  const mimeType = attachment.mimeType ?? 'application/octet-stream';
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  const file = new File([arrayBuffer], name, { type: mimeType });
  const mediaUri = await uploadToArweave(file);

  const isImage = attachment.type === 'image';
  const uri = await uploadJson({
    name,
    image: isImage ? mediaUri : undefined,
    animation_url: isImage ? undefined : mediaUri,
    content: { mime: mimeType, uri: mediaUri },
  });

  return { uri, mediaUri, mimeType };
};

export default uploadTelegramAttachment;
