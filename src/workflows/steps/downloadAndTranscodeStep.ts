import { Address } from 'viem';
import { downloadVideo } from '@/lib/mux/downloadVideo';
import { transcodeIfH265 } from '@/lib/video/transcodeIfH265';
import uploadToArweave, {
  ArweaveUploadResult,
} from '@/lib/arweave/uploadToArweave';
import insertArweaveUpload from '@/lib/supabase/in_process_arweave_uploads/insertArweaveUpload';
import { unauthTurboClient } from '@/lib/arweave/turboClient';

export default async function downloadAndTranscodeStep(
  downloadUrl: string,
  artistAddress: Address
): Promise<ArweaveUploadResult> {
  'use step';
  console.log('downloadAndTranscodeStep: downloading', { downloadUrl });
  const videoFile = await downloadVideo(downloadUrl);
  console.log('downloadAndTranscodeStep: downloaded', {
    name: videoFile.name,
    sizeMB: (videoFile.size / (1024 * 1024)).toFixed(2),
  });
  const transcode = await transcodeIfH265(videoFile);
  console.log('downloadAndTranscodeStep: transcode', {
    codec: transcode.codec,
    needsReencode: transcode.needsReencode,
    reason: transcode.reason,
    originalSizeMB: transcode.originalSizeMB,
    transcodedSizeMB: transcode.transcodedSizeMB,
    transcodeTimeSeconds: transcode.transcodeTimeSeconds,
  });
  const readyFile = transcode.file;
  const result = await uploadToArweave(readyFile);

  unauthTurboClient
    .getTokenPriceForBytes({ byteCount: readyFile.size })
    .then(({ tokenPrice }) =>
      insertArweaveUpload({
        arweave_uri: result.arweave_uri,
        winc_cost: result.winc_cost,
        usdc_cost: Number(tokenPrice),
        file_size_bytes: readyFile.size,
        content_type: readyFile.type || 'video/mp4',
        artist_address: artistAddress,
      })
    )
    .catch((e: unknown) => console.error('logArweaveUpload:', e));

  return result;
}
