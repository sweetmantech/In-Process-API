import isPrivateVercelBlob from '@/lib/url/isPrivateVercelBlob';

const getBlob = async (url: string) => {
  try {
    const headers: HeadersInit = {};
    if (isPrivateVercelBlob(url)) {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, { headers });
    const type = response.headers.get('content-type') || '';
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type });
    return { blob, type };
  } catch (error) {
    throw new Error(error as string);
  }
};

export default getBlob;
