import { sendSms } from '@/lib/phones/sendSms';
import { IS_TESTNET, SITE_ORIGINAL_URL } from '@/lib/consts';

export async function processMomentMessage(
  contractAddress: string,
  tokenId: string,
  phoneNumber: string
) {
  const message = `Moment created! ${SITE_ORIGINAL_URL}/sms/${IS_TESTNET ? 'bsep' : 'base'}:${contractAddress}/${tokenId}`;
  await sendSms(phoneNumber, message);
}
