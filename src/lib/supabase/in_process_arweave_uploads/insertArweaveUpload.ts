import { supabase } from '@/lib/supabase/client';

const insertArweaveUpload = (row: {
  arweave_uri: string;
  winc_cost: string;
  usdc_cost?: number | null;
  file_size_bytes: number;
  content_type: string;
  artist_address: string;
}) =>
  supabase
    .from('in_process_arweave_uploads')
    .upsert(row, { onConflict: 'arweave_uri', ignoreDuplicates: true });

export default insertArweaveUpload;
