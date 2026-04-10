import { indexerChannel } from '@/lib/supabase/client';

export function broadcastMomentsCountUpdated(): void {
  indexerChannel
    .send({ type: 'broadcast', event: 'moments:count-updated', payload: {} })
    .catch(console.error);
}
