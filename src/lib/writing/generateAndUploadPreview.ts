import uploadFileToSupabase from '@/lib/supabase/storage/uploadFileToSupabase';
import generateTextPreview from './generateTextPreview';

const generateAndUploadPreview = async (
  writingText: string
): Promise<string> => {
  if (!writingText.trim()) return '';

  try {
    const previewFile = await generateTextPreview(writingText);
    return await uploadFileToSupabase(previewFile);
  } catch (error) {
    console.error('Failed to generate text preview:', error);
    return '';
  }
};

export default generateAndUploadPreview;
