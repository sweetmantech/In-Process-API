import { randomUUID } from 'crypto';
import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import getStateAdapter from './stateAdapter';
import { MEDIA_GROUP_WINDOW_MS } from './consts';

/**
 * Telegram sends ungrouped photos (album checkbox off) as separate messages
 * with no media_group_id. This synthesizes one so a burst of them arriving
 * within MEDIA_GROUP_WINDOW_MS is minted together via the same group-media
 * pipeline used for real media groups, instead of racing N concurrent mints.
 */
async function getOrCreateUngroupedBurstId(
  thread: Thread<TelegramThreadState>
): Promise<string> {
  const stateAdapter = getStateAdapter(thread);
  const burstKey = `ungrouped_burst:${thread.channelId}`;
  const candidateBurstId = `ungrouped:${thread.channelId}:${randomUUID()}`;

  const created = await stateAdapter.setIfNotExists(
    burstKey,
    candidateBurstId,
    MEDIA_GROUP_WINDOW_MS
  );
  if (created) return candidateBurstId;

  const existing = await stateAdapter.get(burstKey);
  if (typeof existing !== 'string') return candidateBurstId;

  // Slide the window forward: as long as photos keep arriving within
  // MEDIA_GROUP_WINDOW_MS of each other, the burst stays alive.
  await stateAdapter.set(burstKey, existing, MEDIA_GROUP_WINDOW_MS);
  return existing;
}

export default getOrCreateUngroupedBurstId;
