import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';

const getMomentSuccessMessage = (
  contractAddress: string,
  tokenId: string
): string => {
  const chain = IS_TESTNET ? 'bsep' : 'base';
  return `Moment created, ready for editing at ${SITE_ORIGINAL_URL}/sms/${chain}:${contractAddress}/${tokenId}`;
};

export default getMomentSuccessMessage;
