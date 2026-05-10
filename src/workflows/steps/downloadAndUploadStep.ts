import { Address } from 'viem';
import { downloadVideo } from '@/lib/mux/downloadVideo';
import uploadToArweave, {
  ArweaveUploadResult,
} from '@/lib/arweave/uploadToArweave';
import insertArweaveUpload from '@/lib/supabase/in_process_arweave_uploads/insertArweaveUpload';
import { unauthTurboClient } from '@/lib/arweave/turboClient';

export default async function downloadAndUploadStep(
  downloadUrl: string,
  artistAddress: Address
): Promise<ArweaveUploadResult> {
  'use step';

  console.log('downloadAndUploadStep: downloading', { downloadUrl });
  const videoFile = await downloadVideo(downloadUrl);
  console.log('downloadAndUploadStep: downloaded', {
    name: videoFile.name,
    sizeMB: (videoFile.size / (1024 * 1024)).toFixed(2),
  });

  const result = await uploadToArweave(videoFile);

  unauthTurboClient
    .getTokenPriceForBytes({ byteCount: videoFile.size })
    .then(({ tokenPrice }) =>
      insertArweaveUpload({
        arweave_uri: result.arweave_uri,
        winc_cost: result.winc_cost,
        usdc_cost: Number(tokenPrice),
        file_size_bytes: videoFile.size,
        content_type: videoFile.type || 'video/mp4',
        artist_address: artistAddress,
      })
    )
    .catch((e: unknown) => console.error('logArweaveUpload:', e));

  return result;
}
