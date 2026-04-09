export const isRateLimitError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const err = error as Record<string, unknown>;
  return !!(
    err.status === 429 ||
    err.statusCode === 429 ||
    err.code === 429 ||
    (typeof err.message === 'string' && err.message.includes('429')) ||
    (typeof err.message === 'string' &&
      err.message.toLowerCase().includes('rate limit')) ||
    (err.response &&
      typeof err.response === 'object' &&
      (err.response as Record<string, unknown>).status === 429)
  );
};
