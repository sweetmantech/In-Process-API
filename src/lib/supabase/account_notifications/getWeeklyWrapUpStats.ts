import { supabase } from '@/lib/supabase/client';

const getWeeklyWrapUpStats = async () => {
  const { data, error } = await supabase.rpc('get_weekly_wrap_up_stats');
  if (error) throw error;
  return data ?? [];
};

export default getWeeklyWrapUpStats;
