import { uploadJson } from '../arweave/uploadJson';
import { uploadWritingFile } from '../arweave/uploadWritingFile';
import logArweaveUpload from '../arweave/logArweaveUpload';
import { generateAndUploadPreview } from './generateAndUploadPreview';

export const uploadWritingWithJson = async (
  name: string,
  content: string,
  artistAddress: string,
  description = ''
): Promise<string> => {
  const writingResult = await uploadWritingFile(content);
  logArweaveUpload(writingResult, {
    file_size_bytes: Buffer.byteLength(content),
    content_type: 'text/plain',
    artist_address: artistAddress,
  });

  const previewUri = await generateAndUploadPreview(content, artistAddress);

  const jsonObject = {
    name,
    description,
    external_url: previewUri,
    image: previewUri,
    animation_url: writingResult.arweave_uri,
    content: {
      mime: 'text/plain',
      uri: writingResult.arweave_uri,
    },
  };
  const jsonResult = await uploadJson(jsonObject);
  logArweaveUpload(jsonResult, {
    file_size_bytes: Buffer.byteLength(JSON.stringify(jsonObject)),
    content_type: 'application/json',
    artist_address: artistAddress,
  });

  return jsonResult.arweave_uri;
};
