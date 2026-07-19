const NONCE_ERROR_PATTERN = /AA25|invalid account nonce/i;

const isNonceRetryableError = (error: unknown): boolean =>
  error instanceof Error && NONCE_ERROR_PATTERN.test(error.message);

export default isNonceRetryableError;
