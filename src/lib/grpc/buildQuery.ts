import type { IndexConfig } from '@/types/indexerFactory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildQuery(activeIndexers: IndexConfig<any>[]): string {
  const varDefs = ['$limit: Int'];
  for (const { indexName } of activeIndexers) {
    varDefs.push(`$offset_${indexName}: Int`);
    varDefs.push(`$minTimestamp_${indexName}: Int`);
  }
  const bodies = activeIndexers.map((i) => `  ${i.queryFragment}`).join('\n');
  return `query GetAll(${varDefs.join(', ')}) {\n${bodies}\n}`;
}
