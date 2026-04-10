import type {
  Catalog_Moments_t,
  InProcess_Moments_t,
  Sound_Moments_t,
} from '@/types/envio';
import { indexerChannel } from '@/lib/supabase/client';

export function broadcastMomentUpdated(
  moments: InProcess_Moments_t[] | Catalog_Moments_t[] | Sound_Moments_t[]
): void {
  Promise.all(
    moments.map((moment) =>
      indexerChannel.send({
        type: 'broadcast',
        event: 'moment:updated',
        payload: {
          collectionAddress: moment.collection,
          tokenId: 'tier' in moment ? moment.tier + 1 : Number(moment.token_id),
          chainId: moment.chain_id,
        },
      })
    )
  ).catch(console.error);
}
