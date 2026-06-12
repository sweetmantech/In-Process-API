import { TokenMetadataJson } from '@/lib/protocolSdk/ipfs/types';
import { isNonPermanentUri } from './isNonPermanentUri';

export interface MigrationCandidate {
  key: string;
  value: string;
}

export interface MigrationTargets {
  downloadCandidates: MigrationCandidate[];
  hlsAnimationUrl: string | null;
  hasTargets: boolean;
}

const MUX_HLS_PATTERN = /stream\.mux\.com\/[^/]+\.m3u8/;

const getMigrationTargets = (metadata: TokenMetadataJson): MigrationTargets => {
  const allCandidates = [
    { key: 'image', value: metadata.image },
    { key: 'animation_url', value: metadata.animation_url },
    { key: 'content.uri', value: metadata.content?.uri },
  ].filter((c): c is MigrationCandidate => isNonPermanentUri(c.value));

  const hlsItem = allCandidates.find(
    (c) => c.key === 'animation_url' && MUX_HLS_PATTERN.test(c.value)
  );

  return {
    downloadCandidates: allCandidates.filter((c) => c !== hlsItem),
    hlsAnimationUrl: hlsItem?.value ?? null,
    hasTargets: allCandidates.length > 0,
  };
};

export default getMigrationTargets;
