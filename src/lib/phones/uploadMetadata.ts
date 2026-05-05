import { uploadJson } from '../arweave/uploadJson';
import getMediaBlob from './getMediaBlob';
import uploadToArweave from '../arweave/uploadToArweave';
import logArweaveUpload from '../arweave/logArweaveUpload';
import { InboundMessagePayload } from 'telnyx/resources/shared';

const uploadMetadata = async (
  media: NonNullable<InboundMessagePayload['media']>[number],
  payload: InboundMessagePayload | undefined,
  artistAddress: string
) => {
  const blob = await getMediaBlob(media);
  const name = payload?.subject || payload?.text || `photo-${Date.now()}`;
  const file = new File([blob], name, { type: media.content_type });
  const mediaResult = await uploadToArweave(file);
  logArweaveUpload(mediaResult, {
    file_size_bytes: file.size,
    content_type: file.type,
    artist_address: artistAddress,
  });

  const mediaUri = mediaResult.arweave_uri;
  let image = undefined;
  let animation_url = undefined;
  if (media.content_type?.includes('image')) {
    image = mediaUri;
  } else {
    animation_url = mediaUri;
  }

  const jsonObject = {
    name,
    description: payload?.text || '',
    image,
    animation_url,
    content: {
      mime: media.content_type,
      uri: mediaUri,
    },
  };
  const jsonResult = await uploadJson(jsonObject);
  logArweaveUpload(jsonResult, {
    file_size_bytes: Buffer.byteLength(JSON.stringify(jsonObject)),
    content_type: 'application/json',
    artist_address: artistAddress,
  });

  return {
    uri: jsonResult.arweave_uri,
    name,
  };
};

export default uploadMetadata;
