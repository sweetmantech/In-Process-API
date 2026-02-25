import { getFetchableUrl } from '@/lib/protocolSdk/ipfs/gateway';
import { isArweaveURL } from '@/lib/protocolSdk/ipfs/arweave';
import readFromArweave from '@/lib/arweave/readFromArweave';

interface WritingData {
  writingText: string;
  totalLines: number;
}

const getWritingData = async (
  contentUri: string | undefined
): Promise<WritingData> => {
  let response: Response;

  if (isArweaveURL(contentUri)) {
    response = await readFromArweave(contentUri!);
  } else {
    const fetchableUrl = await getFetchableUrl(contentUri);
    if (!fetchableUrl)
      throw Error('failed to convert content uri to fetchable url');
    response = await fetch(fetchableUrl);
  }

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
