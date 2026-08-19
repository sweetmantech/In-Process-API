import { SITE_ORIGINAL_URL } from '@/lib/consts';

export default function buildImageProxyUrl(imageUrl: string): string {
  return `${SITE_ORIGINAL_URL}/api/media/image?url=${encodeURIComponent(imageUrl)}&f=jpeg`;
}
