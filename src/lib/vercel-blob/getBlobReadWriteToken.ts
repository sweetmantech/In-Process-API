export const BLOB_API_URL =
  process.env.VERCEL_BLOB_API_URL ?? 'https://vercel.com/api/blob';

export const BLOB_API_VERSION = '12';

export default function getBlobReadWriteToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  return token;
}
