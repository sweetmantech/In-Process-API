import deleteFileFromSupabase from '@/lib/supabase/storage/deleteFileFromSupabase';

export default async function deleteSupabaseFilesStep(
  urls: string[]
): Promise<void> {
  'use step';
  await Promise.all(urls.map((url) => deleteFileFromSupabase(url)));
}
