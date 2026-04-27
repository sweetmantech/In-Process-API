import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/consts', () => ({
  SITE_ORIGINAL_URL: 'https://inprocess.test',
  SHORT_CHAIN_NAME: {
    8453: 'base',
    84532: 'bsep',
    1: 'eth',
  },
}));
vi.mock('@/lib/supabase/in_process_messages/selectMessage', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/telegram/client', () => ({
  telegramChatBotClient: { sendMessage: vi.fn() },
}));
vi.mock('@/lib/messages/logMessage', () => ({
  logMessage: vi.fn(),
}));
vi.mock('../getAirdropOperator', () => ({
  default: vi.fn(),
}));
import { logMessage } from '@/lib/messages/logMessage';
import selectMessage from '@/lib/supabase/in_process_messages/selectMessage';
import { telegramChatBotClient } from '@/lib/telegram/client';
import type { Transfers_t } from '@/types/envio';
import getAirdropOperator from '../getAirdropOperator';
import notifyAirdrop from '../notifyAirdrop';

const mockSelectMessage = vi.mocked(selectMessage);
const mockSend = vi.mocked(telegramChatBotClient.sendMessage);
const mockLog = vi.mocked(logMessage);
const mockGetAirdropOperator = vi.mocked(getAirdropOperator);

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
    mockGetAirdropOperator.mockResolvedValue({
      address: '0x9999999999999999999999999999999999999999',
      username: 'airdropper',
    });
    mockSelectMessage.mockResolvedValue({
      error: null,
      data: {
        chat_id: 'chat-1',
        in_process_message_metadata: {
          created_at: '2020-01-01T00:00:00.000Z',
          artist_address: null,
          client: 'telegram',
        },
      },
    });
    mockSend.mockResolvedValue({} as never);
    mockLog.mockResolvedValue('msg-1');
  });

  it('returns without calling Telegram when batch is empty', async () => {
    await notifyAirdrop([]);

    expect(mockSelectMessage).not.toHaveBeenCalled();
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

    expect(mockSelectMessage).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sends one Telegram and logs one message per airdrop transfer', async () => {
    const t = transfer();
    await notifyAirdrop([t]);

    expect(mockGetAirdropOperator).toHaveBeenCalledWith('0xtx1', 8453);
    expect(mockSelectMessage).toHaveBeenCalledWith(
      '0xrecipient00000000000000000000000000dead'
    );
    const expectedText =
      'airdropper... airdropped a moment on In Process. \n\n' +
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

  it('does not send when selectMessage has no chat_id', async () => {
    mockSelectMessage.mockResolvedValue({ error: null, data: null });
    await notifyAirdrop([transfer()]);

    expect(mockGetAirdropOperator).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockLog).not.toHaveBeenCalled();
  });

  it('does not send when getAirdropOperator returns no username', async () => {
    mockGetAirdropOperator.mockResolvedValue({
      address: '0x1111111111111111111111111111111111111111',
      username: null,
    });
    await notifyAirdrop([transfer()]);

    expect(mockSelectMessage).toHaveBeenCalled();
    expect(mockGetAirdropOperator).toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockLog).not.toHaveBeenCalled();
  });

  it('logs and does not send when getAirdropOperator throws (e.g. operator not found)', async () => {
    mockGetAirdropOperator.mockRejectedValue(
      new Error('Airdrop operator not found')
    );
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await notifyAirdrop([transfer({ id: 'e-noop' })]);

    expect(errSpy).toHaveBeenCalledWith(
      '❌ notifyAirdrop failed (recipient 0xrecipient00000000000000000000000000dead, transfer e-noop):',
      'Airdrop operator not found'
    );
    expect(mockSend).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('sends two messages for two airdrops to the same recipient', async () => {
    await notifyAirdrop([
      transfer({ id: 'a', token_id: '1' }),
      transfer({ id: 'b', token_id: '2' }),
    ]);

    expect(mockSelectMessage).toHaveBeenCalledTimes(2);
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

  it('logs and continues when sendMessage throws', async () => {
    const err = new Error('telegram down');
    mockSend.mockRejectedValueOnce(err);
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await notifyAirdrop([transfer({ id: 'e-fail' })]);

    expect(errSpy).toHaveBeenCalledWith(
      '❌ notifyAirdrop failed (recipient 0xrecipient00000000000000000000000000dead, transfer e-fail):',
      'telegram down'
    );
    errSpy.mockRestore();
  });
});
