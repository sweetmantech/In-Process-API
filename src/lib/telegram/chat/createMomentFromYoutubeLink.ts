import type { Address } from 'viem';
import { uploadJson } from '@/lib/arweave/uploadJson';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import getYoutubeDetail from '@/lib/link/getYoutubeDetail';
import createMomentFromTelegramAttachment from './createMomentFromTelegramAttachment';

const createMomentFromYoutubeLink = async (
  url: string,
  artistAddress: Address
) => {
  const detail = await getYoutubeDetail(url);
  if (!detail) throw new Error('Failed to fetch YouTube details');

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

  return createMomentFromTelegramAttachment({
    uri: metadataUri,
    name: detail.title,
    artistAddress,
  });
};

export default createMomentFromYoutubeLink;
