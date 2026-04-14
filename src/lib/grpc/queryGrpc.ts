import { GRPC_ENDPOINT } from '@/lib/consts';

const LEGACY_COMMENTS_FIELD = 'InProcess_Moment_Comments';
const CURRENT_COMMENTS_FIELD = 'InProcess_Comments';

const hasMissingFieldError = (errors: unknown[], fieldName: string): boolean =>
  errors.some((error) => {
    if (!error || typeof error !== 'object') return false;
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' && message.includes(`'${fieldName}'`);
  });

const swapCommentsFieldInQuery = (query: string): string | null => {
  if (query.includes(LEGACY_COMMENTS_FIELD)) {
    return query.replaceAll(LEGACY_COMMENTS_FIELD, CURRENT_COMMENTS_FIELD);
  }
  if (query.includes(CURRENT_COMMENTS_FIELD)) {
    return query.replaceAll(CURRENT_COMMENTS_FIELD, LEGACY_COMMENTS_FIELD);
  }
  return null;
};

const fetchGraphql = async (
  query: string,
  variables: Record<string, number>
) => {
  const response = await fetch(GRPC_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as {
    errors?: unknown[];
    data?: Record<string, unknown[]>;
  };
};

export async function queryGrpc(
  query: string,
  variables: Record<string, number>
): Promise<Record<string, unknown[]>> {
  const firstAttempt = await fetchGraphql(query, variables);
  if (!firstAttempt.errors) {
    return firstAttempt.data || {};
  }

  const fallbackQuery = swapCommentsFieldInQuery(query);
  if (
    fallbackQuery &&
    (hasMissingFieldError(firstAttempt.errors, LEGACY_COMMENTS_FIELD) ||
      hasMissingFieldError(firstAttempt.errors, CURRENT_COMMENTS_FIELD))
  ) {
    const secondAttempt = await fetchGraphql(fallbackQuery, variables);
    if (!secondAttempt.errors) {
      return secondAttempt.data || {};
    }
    throw new Error(`GraphQL errors: ${JSON.stringify(secondAttempt.errors)}`);
  }

  throw new Error(`GraphQL errors: ${JSON.stringify(firstAttempt.errors)}`);
}
