import fetchUri from '@/lib/arweave/fetchUri';
import normalizeMetadata from '@/lib/metadata/normalizeMetadata';

const getMetadataHandler = async ({
  uri,
  contentUri,
}: {
  uri: string;
  contentUri?: string;
}) => {
  let response: Response;
  try {
    response = await fetchUri(uri, { cache: 'no-store' });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { image: '', name: '', description: '', external_url: '' };
    }
    throw err;
  }

  try {
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : JSON.parse(await response.text());
    return normalizeMetadata(data, contentUri);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { image: '', name: '', description: '', external_url: '' };
    }
    throw new Error('URI did not return JSON');
  }
};

export default getMetadataHandler;
