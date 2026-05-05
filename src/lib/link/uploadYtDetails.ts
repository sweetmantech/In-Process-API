import { uploadJson } from '@/lib/arweave/uploadJson';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import type { LinkPreview } from '@/types/link';

const uploadYtDetails = async (
  detail: LinkPreview,
  url: string,
  artistAddress: string
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
    const thumbResult = await uploadToArweave(thumbnailFile);
    logArweaveUpload(thumbResult, {
      file_size_bytes: thumbnailFile.size,
      content_type: contentType,
      artist_address: artistAddress,
    });
    imageUri = thumbResult.arweave_uri;
  }

  const jsonObject = {
    name: detail.title,
    description: detail.description,
    image: imageUri,
    external_url: url,
    content: {
      mime: contentType,
      uri: imageUri,
    },
  };
  const jsonResult = await uploadJson(jsonObject);
  logArweaveUpload(jsonResult, {
    file_size_bytes: Buffer.byteLength(JSON.stringify(jsonObject)),
    content_type: 'application/json',
    artist_address: artistAddress,
  });

  return { metadataUri: jsonResult.arweave_uri };
};

export default uploadYtDetails;
