import { sleep } from 'workflow';
import { start } from 'workflow/api';
import { Address } from 'viem';
import fetchMetadataStep from './steps/fetchMetadataStep';
import downloadVideoStep from './steps/downloadVideoStep';
import transcodeStep from './steps/transcodeStep';
import uploadVideoStep from './steps/uploadVideoStep';
import uploadMetadataStep from './steps/uploadMetadataStep';
import updateOnChainStep from './steps/updateOnChainStep';
import deleteMuxAssetStep from './steps/deleteMuxAssetStep';

export interface MigrateMuxToArweavePayload {
  artistAddress: Address;
  moment: { collectionAddress: Address; tokenId: string; chainId: number };
  uri: string;
}

async function migrateMuxToArweave(p: MigrateMuxToArweavePayload) {
  'use workflow';

  const { moment, artistAddress, uri } = p;

  const metadata = await fetchMetadataStep(uri);

  if (!metadata.content?.uri?.includes('mux.com')) {
    return { success: true, skipped: true, tokenId: moment.tokenId };
  }

  const playbackUrl =
    typeof metadata.animation_url === 'string' &&
    metadata.animation_url.includes('stream.mux.com')
      ? metadata.animation_url
      : undefined;

  const videoFile = await downloadVideoStep(metadata.content.uri);
  const transcodedFile = await transcodeStep(videoFile);
  const uploadResult = await uploadVideoStep(transcodedFile, artistAddress);
  const metadataUri = await uploadMetadataStep(
    metadata,
    uploadResult.arweave_uri
  );

  await sleep('10 minutes');

  await updateOnChainStep({
    moment,
    metadataUri,
    metadataName: metadata.name,
    artistAddress,
  });

  if (playbackUrl) {
    await deleteMuxAssetStep(playbackUrl);
  }

  return {
    success: true,
    tokenId: moment.tokenId,
    arweaveUri: uploadResult.arweave_uri,
    metadataUri,
  };
}

export default (payload: MigrateMuxToArweavePayload): void => {
  start(migrateMuxToArweave, [payload]).catch((e) =>
    console.error('migrate workflow start failed', e)
  );
};
