import { SITE_ORIGINAL_URL, SHORT_CHAIN_NAME } from '@/lib/consts';
import buildCollectNotificationHtml from '@/lib/emails/buildCollectNotificationHtml';
import getCreatorTelegramChatIdCached from '@/lib/emails/getCreatorTelegramChatIdCached';
import buildImageProxyUrl from '@/lib/media/buildImageProxyUrl';
import getCreatorEmailCached from '@/lib/emails/getCreatorEmailCached';
import sendResendEmail from '@/lib/resend/sendResendEmail';
import { telegramChatBotClient } from '@/lib/telegram/client';

type MomentForCollectEmail = {
  token_id: number;
  collection: {
    address: string;
    chain_id: number;
    creator: string;
  };
  metadata: {
    name: string | null;
    image: string | null;
  };
};

export default async function sendCollectEmailForTransfer({
  collectorAddress,
  moment,
  creatorEmailCache,
  creatorTelegramChatIdCache,
  collectorUsernameByAddress,
}: {
  collectorAddress: string;
  moment: MomentForCollectEmail;
  creatorEmailCache: Map<string, string | null>;
  creatorTelegramChatIdCache: Map<string, string | null>;
  collectorUsernameByAddress: Map<string, string | null>;
}): Promise<void> {
  const creatorAddress = moment.collection.creator as string;
  const normalizedCollectorAddress = collectorAddress.toLowerCase();
  const collectorUsername =
    collectorUsernameByAddress.get(normalizedCollectorAddress) ?? null;

  const momentName = moment.metadata?.name?.trim() || null;
  const chain = SHORT_CHAIN_NAME[moment.collection.chain_id] ?? 'base';
  const collectUrl = `${SITE_ORIGINAL_URL}/collect/${chain}:${moment.collection.address.toLowerCase()}/${moment.token_id}`;
  const collectorUrl = `${SITE_ORIGINAL_URL}/${normalizedCollectorAddress}`;
  const imageUrl = moment.metadata?.image
    ? buildImageProxyUrl(moment.metadata.image)
    : null;

  const subject = 'In Process notification: someone collected your moment';
  const textCollector = collectorUsername ?? normalizedCollectorAddress;
  const email = await getCreatorEmailCached({
    creatorAddress,
    cache: creatorEmailCache,
  });

  if (email) {
    const html = buildCollectNotificationHtml({
      textCollector,
      collectorUrl,
      momentName,
      collectUrl,
      imageUrl,
    });

    try {
      await sendResendEmail({
        to: email,
        subject,
        html,
      });
      return;
    } catch (e) {
      console.error('[resend] collect email send failed:', e);
    }
  }

  try {
    const telegramChatId = await getCreatorTelegramChatIdCached({
      creatorAddress,
      cache: creatorTelegramChatIdCache,
    });
    if (!telegramChatId) return;

    const text = `${textCollector} collected your moment.\n\n${collectUrl}`;

    await telegramChatBotClient.sendMessage(telegramChatId, text);
  } catch (e) {
    console.error('[collect-telegram] collect notification send failed:', e);
  }
}
