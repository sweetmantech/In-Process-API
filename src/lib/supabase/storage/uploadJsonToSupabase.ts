import uploadFileToSupabase from './uploadFileToSupabase';

const uploadJsonToSupabase = async (json: object): Promise<string> => {
  const file = new File([JSON.stringify(json)], 'metadata.json', {
    type: 'application/json',
  });
  return uploadFileToSupabase(file);
};

export default uploadJsonToSupabase;
