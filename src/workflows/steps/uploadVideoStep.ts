import { Address } from 'viem';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';

export default async function uploadVideoStep(
  videoFile: File,
  artistAddress: Address
): Promise<{ arweave_uri: string; winc_cost: string }> {
  'use step';
  const result = await uploadToArweave(videoFile);
  logArweaveUpload(result, {
    file_size_bytes: videoFile.size,
    content_type: videoFile.type || 'video/mp4',
    artist_address: artistAddress,
  });
  return result;
}
