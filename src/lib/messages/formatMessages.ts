import { Tables } from '@/lib/supabase/types';

type MomentData = Tables<'in_process_moments'> & {
  collection: Tables<'in_process_collections'> | null;
};

export type Message = Tables<'in_process_messages'> & {
  metadata: Tables<'in_process_message_metadata'>;
  moment: {
    in_process_moments: MomentData;
  }[];
};

export type FormattedMessage = Omit<Message, 'moment'> & {
  moment: MomentData | null;
};

const formatMessages = (messages: Message[]): FormattedMessage[] => {
  return messages.map(({ moment, ...rest }) => ({
    ...rest,
    moment: moment?.[0]?.in_process_moments ?? null,
  }));
};

export default formatMessages;
