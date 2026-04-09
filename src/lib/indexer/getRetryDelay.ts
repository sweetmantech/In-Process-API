import { isRateLimitError } from './isRateLimitError';

export const getRetryDelay = (
  error: unknown,
  attempt: number,
  baseDelay: number
): number => {
  if (!error || typeof error !== 'object') {
    return baseDelay * Math.pow(2, attempt);
  }
  const err = error as Record<string, unknown>;
  const retryAfter =
    (err.response &&
      typeof err.response === 'object' &&
      (err.response as Record<string, unknown>).headers &&
      typeof (err.response as Record<string, unknown>).headers === 'object' &&
      (
        (err.response as Record<string, unknown>).headers as Record<
          string,
          unknown
        >
      )['retry-after']) ||
    (err.headers &&
      typeof err.headers === 'object' &&
      (err.headers as Record<string, unknown>)['retry-after']);

  if (retryAfter) {
    const seconds = parseInt(String(retryAfter), 10);
    if (!isNaN(seconds) && seconds > 0) return seconds * 1000;
  }

  if (isRateLimitError(error)) return 5000 * Math.pow(2, attempt);
  return baseDelay * Math.pow(2, attempt);
};
