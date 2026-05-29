import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Transfers_t } from '@/types/envio';

vi.mock(
  '@/lib/supabase/account_notifications/selectAccountNotification',
  () => ({
    default: vi.fn(),
  })
);
vi.mock('@/lib/telegram/client', () => ({
  telegramChatBotClient: { sendMessage: vi.fn() },
}));
vi.mock('../getAirdropOperator', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  SHORT_CHAIN_NAME: { 8453: 'base' },
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import selectAccountNotification from '@/lib/supabase/account_notifications/selectAccountNotification';
import { telegramChatBotClient } from '@/lib/telegram/client';
import getAirdropOperator from '../getAirdropOperator';
import notifyAirdrop from '../notifyAirdrop';

const RECIPIENT = '0xrecipient0000000000000000000000000000000';
const SENDER = '0xsender00000000000000000000000000000000000';
const CHAT_ID = '1352384640';

const makeTransfer = (overrides: Partial<Transfers_t> = {}): Transfers_t =>
  ({
    id: 'transfer-1',
    recipient: RECIPIENT,
    collection: '0xcollection',
    token_id: 1,
    chain_id: 8453,
    value: null,
    currency: null,
    ...overrides,
  }) as Transfers_t;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectAccountNotification).mockResolvedValue({
    telegram_chat_id: CHAT_ID,
  } as any);
  vi.mocked(getAirdropOperator).mockResolvedValue({
    address: SENDER,
    username: 'alice',
  });
  vi.mocked(telegramChatBotClient.sendMessage).mockResolvedValue(
    undefined as never
  );
});

describe('notifyAirdrop', () => {
  it('skips transfers where both value and currency are set', async () => {
    await notifyAirdrop([makeTransfer({ value: '100', currency: '0xUsdc' })]);
    expect(telegramChatBotClient.sendMessage).not.toHaveBeenCalled();
  });

  it('skips notification when recipient has no notification settings', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue(null);
    await notifyAirdrop([makeTransfer()]);
    expect(telegramChatBotClient.sendMessage).not.toHaveBeenCalled();
  });

  it('skips notification when no telegram_chat_id is found', async () => {
    vi.mocked(selectAccountNotification).mockResolvedValue({
      telegram_chat_id: null,
    } as any);
    await notifyAirdrop([makeTransfer()]);
    expect(telegramChatBotClient.sendMessage).not.toHaveBeenCalled();
  });

  it('skips notification when operator is the recipient', async () => {
    vi.mocked(getAirdropOperator).mockResolvedValue({
      address: RECIPIENT,
      username: null,
    });
    await notifyAirdrop([makeTransfer()]);
    expect(telegramChatBotClient.sendMessage).not.toHaveBeenCalled();
  });

  it('sends telegram notification with airdrop details', async () => {
    await notifyAirdrop([makeTransfer()]);
    expect(telegramChatBotClient.sendMessage).toHaveBeenCalledWith(
      CHAT_ID,
      expect.stringContaining('airdropped a moment')
    );
  });

  it('uses username in message when available', async () => {
    await notifyAirdrop([makeTransfer()]);
    const message = vi.mocked(telegramChatBotClient.sendMessage).mock
      .calls[0][1];
    expect(message).toContain('alice');
  });
});
