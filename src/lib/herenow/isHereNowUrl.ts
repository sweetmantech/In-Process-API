const isHereNowUrl = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return hostname === 'here.now' || hostname.endsWith('.here.now');
  } catch {
    return false;
  }
};

export default isHereNowUrl;
