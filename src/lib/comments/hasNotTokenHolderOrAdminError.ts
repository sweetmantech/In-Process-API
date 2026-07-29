function hasNotTokenHolderOrAdminError(value: unknown): boolean {
  let current: unknown = value;

  for (let i = 0; i < 10; i++) {
    if (!current || typeof current !== 'object') break;

    const errorName =
      'errorName' in current && typeof current.errorName === 'string'
        ? current.errorName
        : undefined;
    const shortMessage =
      'shortMessage' in current && typeof current.shortMessage === 'string'
        ? current.shortMessage
        : undefined;
    const message =
      'message' in current && typeof current.message === 'string'
        ? current.message
        : undefined;

    if (
      errorName === 'NotTokenHolderOrAdmin' ||
      shortMessage?.includes('NotTokenHolderOrAdmin') ||
      message?.includes('NotTokenHolderOrAdmin')
    ) {
      return true;
    }

    current = 'cause' in current ? current.cause : undefined;
  }

  return false;
}

export default hasNotTokenHolderOrAdminError;
