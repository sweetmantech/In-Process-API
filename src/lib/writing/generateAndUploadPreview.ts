import uploadToArweave from '@/lib/arweave/uploadToArweave';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import { generateTextPreview } from './generateTextPreview';

export const generateAndUploadPreview = async (
  writingText: string,
  artistAddress: string
): Promise<string> => {
  if (!writingText.trim()) return '';

  try {
    const previewFile = await generateTextPreview(writingText);
    const result = await uploadToArweave(previewFile);
    logArweaveUpload(result, {
      file_size_bytes: previewFile.size,
      content_type: previewFile.type,
      artist_address: artistAddress,
    });
    return result.arweave_uri;
  } catch (error) {
    console.error('Failed to generate text preview:', error);
    return '';
  }
};
