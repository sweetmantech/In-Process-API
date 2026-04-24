import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/consts', () => ({
  SITE_ORIGINAL_URL: 'https://inprocess.test',
  SHORT_CHAIN_NAME: {
    8453: 'base',
    84532: 'bsep',
    1: 'eth',
  },
}));
vi.mock('@/lib/supabase/in_process_messages/selectChatId', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/telegram/client', () => ({
  telegramChatBotClient: { sendMessage: vi.fn() },
}));
vi.mock('@/lib/messages/logMessage', () => ({
  logMessage: vi.fn(),
}));

import { logMessage } from '@/lib/messages/logMessage';
import selectChatId from '@/lib/supabase/in_process_messages/selectChatId';
import { telegramChatBotClient } from '@/lib/telegram/client';
import type { Transfers_t } from '@/types/envio';
import notifyAirdrop from '../notifyAirdrop';

const mockSelectChat = vi.mocked(selectChatId);
const mockSend = vi.mocked(telegramChatBotClient.sendMessage);
const mockLog = vi.mocked(logMessage);

const USDC = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as const;

const transfer = (over: Partial<Transfers_t> = {}): Transfers_t => ({
  id: 'e1',
  collection: '0xAbC',
  token_id: '7',
  chain_id: 8453,
  recipient: '0xRecipient00000000000000000000000000DEAD',
  quantity: '1',
  value: undefined,
  currency: undefined,
  transaction_hash: '0xtx1',
  transferred_at: 1700000000,
  ...over,
});

describe('notifyAirdrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectChat.mockResolvedValue('chat-1');
    mockSend.mockResolvedValue({} as never);
    mockLog.mockResolvedValue('msg-1');
  });

  it('returns without calling Telegram when batch is empty', async () => {
    await notifyAirdrop([]);

    expect(mockSelectChat).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockLog).not.toHaveBeenCalled();
  });

  it('skips airdrop path when all transfers are priced (value and currency set)', async () => {
    await notifyAirdrop([
      transfer({
        value: '1',
        currency: USDC,
      }),
    ]);

    expect(mockSelectChat).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sends one Telegram and logs one message per airdrop transfer', async () => {
    const t = transfer();
    await notifyAirdrop([t]);

    expect(mockSelectChat).toHaveBeenCalledWith(
      '0xrecipient00000000000000000000000000dead'
    );
    const expectedText =
      'You received a new moment on In Process. \n\n' +
      'https://inprocess.test/collect/base:0xabc/7';
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith('chat-1', expectedText);
    expect(mockLog).toHaveBeenCalledWith(
      [{ type: 'text', text: expectedText }],
      'assistant',
      'chat-1',
      '0xrecipient00000000000000000000000000dead',
      'telegram'
    );
  });

  it('does not send when selectChatId returns null', async () => {
    mockSelectChat.mockResolvedValue(null);
    await notifyAirdrop([transfer()]);

    expect(mockSend).not.toHaveBeenCalled();
    expect(mockLog).not.toHaveBeenCalled();
  });

  it('sends two messages for two airdrops to the same recipient', async () => {
    await notifyAirdrop([
      transfer({ id: 'a', token_id: '1' }),
      transfer({ id: 'b', token_id: '2' }),
    ]);

    expect(mockSelectChat).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockLog).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      'chat-1',
      expect.stringContaining('collect/base:0xabc/1')
    );
    expect(mockSend).toHaveBeenNthCalledWith(
      2,
      'chat-1',
      expect.stringContaining('collect/base:0xabc/2')
    );
  });

  it('sends only for airdrops when batch mixes paid and airdrop', async () => {
    await notifyAirdrop([
      transfer({ id: 'air', value: undefined, currency: undefined }),
      transfer({
        id: 'paid',
        value: '1000000',
        currency: USDC,
      }),
    ]);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('uses base fallback in URL for unknown chain_id', async () => {
    await notifyAirdrop([transfer({ chain_id: 99999 })]);

    expect(mockSend).toHaveBeenCalledWith(
      'chat-1',
      expect.stringContaining('collect/base:0xabc/7')
    );
  });
});
