import { MigrationCandidate } from './getMigrationTargets';

const buildUrlMapFromResults = (
  candidates: MigrationCandidate[],
  resultsBySourceUrl: Map<string, string>,
  hlsAnimationUrl: string | null
): Map<string, string> => {
  const urlMap = new Map<string, string>();
  for (const { key, value } of candidates) {
    const arweaveUri = resultsBySourceUrl.get(value);
    if (arweaveUri) urlMap.set(key, arweaveUri);
  }
  if (hlsAnimationUrl) {
    const contentUri = urlMap.get('content.uri');
    if (contentUri) urlMap.set('animation_url', contentUri);
  }
  return urlMap;
};

export default buildUrlMapFromResults;
