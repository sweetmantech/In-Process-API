import { MessageWithRelations } from '@/lib/supabase/in_process_messages/selectMessage';
import { MOMENT_URL_REGEX } from '../consts';

const isMomentMessage = (message: MessageWithRelations) => {
  if (!message.parts) return false;
  return (message.parts as unknown as { type: string; text?: string }[]).some(
    (part) =>
      part.type === 'text' && part?.text && MOMENT_URL_REGEX.test(part.text)
  );
};

export default isMomentMessage;
