import { AuthErrorMessages } from '@/errors';

const AUTH_ERROR_MESSAGES = [
  AuthErrorMessages.INVALID_AUTH_TOKEN,
  AuthErrorMessages.EXPIRED_AUTH_TOKEN,
  AuthErrorMessages.NO_SOCIAL_OR_ARTIST_WALLET,
  AuthErrorMessages.INVALID_API_KEY,
  AuthErrorMessages.NO_ARTIST_ADDRESS_FOR_API_KEY,
  AuthErrorMessages.NO_VALID_AUTH_METHOD,
];

const isAuthError = (error: any): boolean =>
  AUTH_ERROR_MESSAGES.some((msg) => error?.message?.includes(msg));

export default isAuthError;
