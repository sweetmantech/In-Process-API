import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';

const getMomentsSuccessMessage = (
  contractAddress: string,
  tokenIds: string[]
): string => {
  const chain = IS_TESTNET ? 'bsep' : 'base';
  const lines = tokenIds.map(
    (tokenId) =>
      `#${tokenId}: ${SITE_ORIGINAL_URL}/sms/${chain}:${contractAddress}/${tokenId}`
  );
  return `Moments created, ready for editing at:\n${lines.join('\n')}`;
};

export default getMomentsSuccessMessage;
