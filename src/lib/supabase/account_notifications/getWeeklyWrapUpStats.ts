import { supabase } from '@/lib/supabase/client';

const getWeeklyWrapUpStats = async () =>
  supabase.rpc('get_weekly_wrap_up_stats');

export default getWeeklyWrapUpStats;
