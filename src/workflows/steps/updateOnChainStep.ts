import { Address } from 'viem';
import { updateMomentURI } from '@/lib/moment/updateMomentURI';
import { updateCollectionURI } from '@/lib/collection/updateCollectionURI';

export default async function updateOnChainStep(params: {
  moment: { collectionAddress: Address; tokenId: string; chainId: number };
  metadataUri: string;
  metadataName: string;
  artistId?: string;
  artistAddress: Address;
}): Promise<{ hash: string }> {
  'use step';
  const { moment, metadataUri, metadataName, artistAddress, artistId } = params;
  const effectiveArtistId = artistId ?? artistAddress;

  if (moment.tokenId === '0') {
    return await updateCollectionURI({
      collection: {
        address: moment.collectionAddress,
        chainId: moment.chainId,
      },
      newUri: metadataUri,
      newCollectionName: metadataName,
      artist: {
        artistId: effectiveArtistId,
        primaryWallet: artistAddress,
        wallets: [],
      },
    });
  }

  return await updateMomentURI({
    moment,
    newUri: metadataUri,
    artist: {
      artistId: effectiveArtistId,
      primaryWallet: artistAddress,
      wallets: [],
    },
  });
}
