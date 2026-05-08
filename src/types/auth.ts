export enum AuthMethod {
  FARCaster = 'farcaster',
  Privy = 'privy',
  ApiKey = 'apiKey',
}
export interface AuthResult {
  artistAddress: string;
  authMethod: AuthMethod;
  isWebRequest?: boolean;
}
