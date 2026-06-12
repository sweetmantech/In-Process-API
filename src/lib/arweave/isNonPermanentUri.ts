export const isNonPermanentUri = (uri: string | null | undefined): boolean =>
  !!uri && !uri.startsWith('ar://') && !uri.startsWith('ipfs://');
