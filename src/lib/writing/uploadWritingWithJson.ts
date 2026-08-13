import uploadFileToSupabase from '@/lib/supabase/storage/uploadFileToSupabase';
import uploadJsonToSupabase from '@/lib/supabase/storage/uploadJsonToSupabase';
import generateAndUploadPreview from './generateAndUploadPreview';

const uploadWritingWithJson = async (
  name: string,
  content: string,
  description = ''
): Promise<string> => {
  const writingFile = new File([content], 'writing.txt', {
    type: 'text/plain',
  });
  const writingUri = await uploadFileToSupabase(writingFile);
  const previewUri = await generateAndUploadPreview(content);

  const jsonObject = {
    name,
    description,
    image: previewUri,
    animation_url: writingUri,
    content: {
      mime: 'text/plain',
      uri: writingUri,
    },
  };
  return uploadJsonToSupabase(jsonObject);
};

export default uploadWritingWithJson;
