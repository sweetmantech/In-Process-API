import { uploadJson } from '@/lib/arweave/uploadJson';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import type { LinkPreview } from '@/types/link';

const uploadYtDetails = async (
  detail: LinkPreview,
  url: string
): Promise<{ metadataUri: string }> => {
  let imageUri = '';
  let contentType = 'image/jpeg';
  const thumbnailUrl = detail.images?.[0] || detail.favicons?.[0];
  if (thumbnailUrl) {
    const thumbnailRes = await fetch(thumbnailUrl);
    contentType = thumbnailRes.headers.get('content-type') || 'image/jpeg';
    const thumbnailBlob = await thumbnailRes.blob();
    const thumbnailFile = new File([thumbnailBlob], 'thumbnail', {
      type: contentType,
    });
    imageUri = await uploadToArweave(thumbnailFile);
  }

  const metadataUri = await uploadJson({
    name: detail.title,
    description: detail.description,
    image: imageUri,
    external_url: url,
    content: {
      mime: contentType,
      uri: imageUri,
    },
  });

  return { metadataUri };
};

export default uploadYtDetails;
