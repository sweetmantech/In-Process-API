import { supabase } from '@/lib/supabase/client';

export async function selectMax(fieldName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('in_process_moments')
    .select(`${fieldName}.max()`)
    .single<{ max: string }>();
  if (error) throw error;
  return data?.max ?? null;
}
