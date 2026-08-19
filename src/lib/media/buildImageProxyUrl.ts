const TURBO_GATEWAY_URL = 'https://turbo-gateway.com';

export default function buildImageProxyUrl(imageUrl: string): string {
  if (imageUrl.startsWith('ar://')) {
    return `${TURBO_GATEWAY_URL}/${imageUrl.slice(5)}`;
  }

  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname.replace(/^\/+/, '');
    if (pathname) return `${TURBO_GATEWAY_URL}/${pathname}`;
  } catch {}

  return imageUrl;
}
