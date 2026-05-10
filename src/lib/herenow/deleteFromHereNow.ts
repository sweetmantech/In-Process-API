import isHereNowUrl from '@/lib/herenow/isHereNowUrl';
import extractSlug from '@/lib/herenow/extractSlug';

const deleteFromHereNow = async (url: string): Promise<void> => {
  if (!isHereNowUrl(url)) return;

  const slug = extractSlug(url);
  const apiKey = process.env.HERENOW_API_KEY;
  if (!slug) return;

  await fetch(`https://here.now/api/v1/publish/${slug}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey}` },
  }).catch(() => {});
};

export default deleteFromHereNow;
