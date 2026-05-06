import { after } from 'next/server';
import insertArweaveUpload from '@/lib/supabase/in_process_arweave_uploads/insertArweaveUpload';
import { ensureArtists } from '@/lib/artists/ensureArtists';
import type { ArweaveUploadResult } from './uploadToArweave';
import { unauthTurboClient } from './turboClient';

const logArweaveUpload = (
  result: ArweaveUploadResult,
  meta: {
    file_size_bytes: number;
    content_type: string;
    artist_address: string;
  }
) => {
  after(
    ensureArtists([meta.artist_address])
      .then(() =>
        unauthTurboClient.getTokenPriceForBytes({
          byteCount: meta.file_size_bytes,
        })
      )
      .then(({ tokenPrice }) =>
        insertArweaveUpload({
          arweave_uri: result.arweave_uri,
          winc_cost: result.winc_cost,
          usdc_cost: Number(tokenPrice),
          file_size_bytes: meta.file_size_bytes,
          content_type: meta.content_type,
          artist_address: meta.artist_address,
        })
      )
      .catch((e: unknown) => console.error('❌ logArweaveUpload:', e))
  );
};

export default logArweaveUpload;
