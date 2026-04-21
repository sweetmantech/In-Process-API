import { logMessage } from './logMessage';
import { updatePhoneVerified } from '../supabase/in_process_artist_phones/updatePhoneVerified';
import { sendSms } from '../phones/sendSms';

const processVerificationMessage = async (
  username: string,
  phoneNumber: string
) => {
  const { error, data } = await updatePhoneVerified(phoneNumber);
  if (error || !data) {
    throw new Error('Failed to verify phone.');
  }
  const verificationMessage =
    'Hello ' +
    username +
    ', Your phone number has been verified! You can now text photos and descriptions to post them on In Process.';
  await logMessage(
    [
      {
        type: 'text',
        text: verificationMessage,
      },
    ],
    'assistant',
    undefined,
    data.artist_address
  );
  await sendSms(phoneNumber, verificationMessage);
};

export default processVerificationMessage;
