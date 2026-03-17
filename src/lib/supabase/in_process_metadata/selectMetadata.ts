import { supabase } from '../client';

const selectMetadata = async (momentId: string) => {
  const { data, error } = await supabase
    .from('in_process_metadata')
    .select(
      'id, image, name, description, external_url, animation_url, content'
    )
    .eq('moment', momentId)
    .single();

  if (error || !data) return null;

  return data;
};

export default selectMetadata;
