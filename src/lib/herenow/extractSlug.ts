const extractSlug = (url: string): string | null => {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname.endsWith('.here.now'))
      return hostname.replace('.here.now', '');
    if (hostname === 'here.now') return pathname.split('/')[1] || null;
    return null;
  } catch {
    return null;
  }
};

export default extractSlug;
