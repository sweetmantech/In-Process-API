import { GRPC_ENDPOINT } from '@/lib/consts';

export async function queryGrpc(
  query: string,
  variables: Record<string, number>
): Promise<Record<string, unknown[]>> {
  const response = await fetch(GRPC_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = (await response.json()) as {
    errors?: unknown[];
    data?: Record<string, unknown[]>;
  };

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data || {};
}
