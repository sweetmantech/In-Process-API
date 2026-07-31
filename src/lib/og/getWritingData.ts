import fetchUri from '@/lib/arweave/fetchUri';
import countWritingLines from '@/lib/writing/countWritingLines';

interface WritingData {
  writingText: string;
  totalLines: number;
}

const getWritingData = async (
  contentUri: string | undefined
): Promise<WritingData> => {
  if (!contentUri) throw Error('missing or invalid contentUri');
  const response = await fetchUri(contentUri);

  if (!response.ok)
    throw Error(
      `failed to fetch writing content from ${contentUri}: ${response.status}`
    );

  const writingText = await response.text();
  return { writingText, totalLines: countWritingLines(writingText) };
};

export default getWritingData;
