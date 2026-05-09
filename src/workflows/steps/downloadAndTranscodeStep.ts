import { Address } from 'viem';
import { downloadVideo } from '@/lib/mux/downloadVideo';
import { transcodeIfH265 } from '@/lib/video/transcodeIfH265';
import uploadToArweave, { ArweaveUploadResult } from '@/lib/arweave/uploadToArweave';
import insertArweaveUpload from '@/lib/supabase/in_process_arweave_uploads/insertArweaveUpload';
import { unauthTurboClient } from '@/lib/arweave/turboClient';

export default async function downloadAndTranscodeStep(
  downloadUrl: string,
  artistAddress: Address
): Promise<ArweaveUploadResult> {
  'use step';
  const videoFile = await downloadVideo(downloadUrl);
  const readyFile = await transcodeIfH265(videoFile);
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
