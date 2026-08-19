import { SITE_ORIGINAL_URL, SHORT_CHAIN_NAME } from '@/lib/consts';
import escapeHtml from '@/lib/escapeHtml';
import buildCollectNotificationHtml from '@/lib/emails/buildCollectNotificationHtml';
import getCreatorEmailCached from '@/lib/emails/getCreatorEmailCached';
import sendResendEmail from '@/lib/resend/sendResendEmail';

type MomentForCollectEmail = {
  token_id: number;
  collection: {
    address: string;
    chain_id: number;
    creator: string;
  };
  metadata: {
    name: string | null;
  };
};

export default async function sendCollectEmailForTransfer({
  collectorAddress,
  moment,
  creatorEmailCache,
  collectorUsernameByAddress,
}: {
  collectorAddress: string;
  moment: MomentForCollectEmail;
  creatorEmailCache: Map<string, string | null>;
  collectorUsernameByAddress: Map<string, string | null>;
}): Promise<void> {
  const creatorAddress = moment.collection.creator as string;
  const email = await getCreatorEmailCached({
    creatorAddress,
    cache: creatorEmailCache,
  });
  if (!email) return;

  const normalizedCollectorAddress = collectorAddress.toLowerCase();
  const collectorUsername =
    collectorUsernameByAddress.get(normalizedCollectorAddress) ?? null;

  const momentName = moment.metadata?.name ?? 'your moment';
  const chain = SHORT_CHAIN_NAME[moment.collection.chain_id] ?? 'base';
  const collectUrl = `${SITE_ORIGINAL_URL}/collect/${chain}:${moment.collection.address.toLowerCase()}/${moment.token_id}`;

  const subject = `Someone collected your moment: ${escapeHtml(momentName)}`;
  const textCollector = collectorUsername ?? normalizedCollectorAddress;
  const html = buildCollectNotificationHtml({
    textCollector,
    momentName,
    collectUrl,
  });

  try {
    await sendResendEmail({
      to: email,
      subject,
      html,
    });

    const maskedTo =
      email.length <= 6
        ? '[masked]'
        : `${email.slice(0, 3)}***${email.slice(-3)}`;
    console.log('[collect-email][dev] sent', { to: maskedTo });
  } catch (e) {
    console.error('[resend] collect email send failed:', e);
  }
}
