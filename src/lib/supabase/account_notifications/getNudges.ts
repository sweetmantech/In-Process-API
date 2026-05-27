import { supabase } from '@/lib/supabase/client';

const getNudges = async () => supabase.rpc('get_nudges');

export default getNudges;
