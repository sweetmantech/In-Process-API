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
  let file: File;
  if (downloadUrl.includes('mux.com')) {
    file = await downloadVideo(downloadUrl);
  } else {
    const res = await fetch(downloadUrl);
    const blob = await res.blob();
    const ct = res.headers.get('content-type') || 'application/octet-stream';
    const ext = ct.split('/')[1]?.split(';')[0] || 'bin';
    file = new File([blob], `upload.${ext}`, { type: ct });
  }
  console.log('downloadAndUploadStep: downloaded', {
    name: file.name,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2),
  });

  const result = await uploadToArweave(file);

  unauthTurboClient
    .getTokenPriceForBytes({ byteCount: file.size })
    .then(({ tokenPrice }) =>
      insertArweaveUpload({
        arweave_uri: result.arweave_uri,
        winc_cost: result.winc_cost,
        usdc_cost: Number(tokenPrice),
        file_size_bytes: file.size,
        content_type: file.type || 'application/octet-stream',
        artist_address: artistAddress,
      })
    )
    .catch((e: unknown) => console.error('logArweaveUpload:', e));

  return result;
}
