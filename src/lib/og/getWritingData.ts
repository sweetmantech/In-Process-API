import fetchUri from '@/lib/arweave/fetchUri';

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
  let totalLines = 0;
  const paragraphs = writingText.split('\n');
  paragraphs.map(
    (paragraph) =>
      (totalLines =
        totalLines + parseInt(Number(paragraph.length / 64).toFixed()) + 1)
  );
  return { writingText, totalLines };
};

export default getWritingData;
