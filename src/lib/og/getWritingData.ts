import { getFetchableUrl } from '@/lib/protocolSdk/ipfs/gateway';

interface WritingData {
  writingText: string;
  totalLines: number;
}

const getWritingData = async (
  contentUri: string | undefined
): Promise<WritingData> => {
  const fetchableUrl = getFetchableUrl(contentUri);
  if (!fetchableUrl)
    throw Error('failed to convert content uri to fetchable url');
  const response = await fetch(fetchableUrl);
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
