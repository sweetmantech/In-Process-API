import { supabase } from '@/lib/supabase/client';

const deleteFeeRecipientsByMoment = async (momentId: string) => {
  const { error } = await supabase
    .from('in_process_moment_fee_recipients')
    .delete()
    .eq('moment', momentId);
  if (error) throw error;
};

export default deleteFeeRecipientsByMoment;
