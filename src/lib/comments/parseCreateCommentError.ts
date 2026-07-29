import hasNotTokenHolderOrAdminError from '@/lib/comments/hasNotTokenHolderOrAdminError';

const HOLDER_ERROR_MESSAGE = 'Collect this moment before commenting.';

function parseCreateCommentError(error: unknown): {
  message: string;
  status: number;
} {
  if (hasNotTokenHolderOrAdminError(error)) {
    return {
      message: HOLDER_ERROR_MESSAGE,
      status: 403,
    };
  }

  return {
    message: (error as Error)?.message ?? 'Failed to create comment',
    status: 500,
  };
}

export default parseCreateCommentError;
