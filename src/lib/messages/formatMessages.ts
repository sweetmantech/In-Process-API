import { Tables } from '@/lib/supabase/types';
import selectMessageMetadatas from '@/lib/supabase/in_process_message_metadata/selectMessageMetadatas';

type MomentData = Tables<'in_process_moments'> & {
  collection: Tables<'in_process_collections'> | null;
};

type SelectMessagesData = NonNullable<
  Awaited<ReturnType<typeof selectMessageMetadatas>>['data']
>;

export type FormattedMessage = Omit<
  Tables<'in_process_messages'>,
  'metadata'
> & {
  metadata: Tables<'in_process_message_metadata'>;
  moment: MomentData | null;
};

const formatMessages = (data: SelectMessagesData): FormattedMessage[] => {
  const result: FormattedMessage[] = [];

  for (const metadataRow of data) {
    const { messages, ...metadata } = metadataRow;
    for (const message of messages) {
      const { moment, ...messageFields } = message;
      result.push({
        ...messageFields,
        metadata,
        moment: moment?.[0]?.in_process_moments ?? null,
      });
    }
  }

  return result;
};

export default formatMessages;
