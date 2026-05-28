import { supabase } from '@/lib/supabase/client';

const getNudges = async () => {
  const { data, error } = await supabase.rpc('get_nudges');
  if (error) throw error;
  return data ?? [];
};

export default getNudges;
