import { supabase } from '@/lib/supabase/client';

const deleteWallet = async (address: string) => {
  const { error } = await supabase
    .from('in_process_wallets')
    .delete()
    .eq('address', address.toLowerCase());
  if (error) throw error;
};

export default deleteWallet;
