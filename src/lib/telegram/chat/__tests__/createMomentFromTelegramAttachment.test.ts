import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import createMomentFromTelegramAttachment from '../createMomentFromTelegramAttachment';

vi.mock('@/lib/moment/createMoment', () => ({ createMoment: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  REFERRAL_RECIPIENT: '0xReferral',
  USDC_ADDRESS: { 8453: '0xUsdc' },
}));

import { createMoment } from '@/lib/moment/createMoment';

const ARTIST_ADDRESS = '0xArtist' as Address;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createMoment).mockResolvedValue({
    contractAddress: '0xNewContract' as Address,
    tokenId: '5',
  });
});

describe('createMomentFromTelegramAttachment', () => {
  it('returns contractAddress and tokenId', async () => {
    const result = await createMomentFromTelegramAttachment({
      uri: 'ar://meta',
      name: 'My Moment',
      artistAddress: ARTIST_ADDRESS,
    });

    expect(result).toEqual({ contractAddress: '0xNewContract', tokenId: '5' });
  });

  it('passes uri as both contract uri and tokenMetadataURI', async () => {
    await createMomentFromTelegramAttachment({
      uri: 'ar://meta',
      name: 'My Moment',
      artistAddress: ARTIST_ADDRESS,
    });

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.contract.uri).toBe('ar://meta');
    expect(call.token.tokenMetadataURI).toBe('ar://meta');
  });

  it('sets the contract name from the provided name', async () => {
    await createMomentFromTelegramAttachment({
      uri: 'ar://meta',
      name: 'My Moment',
      artistAddress: ARTIST_ADDRESS,
    });

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.contract.name).toBe('My Moment');
  });

  it('sets artistAddress as payoutRecipient and account', async () => {
    await createMomentFromTelegramAttachment({
      uri: 'ar://meta',
      name: 'My Moment',
      artistAddress: ARTIST_ADDRESS,
    });

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.token.payoutRecipient).toBe(ARTIST_ADDRESS);
    expect(call.account).toBe(ARTIST_ADDRESS);
  });

  it('mints 1 token to the creator', async () => {
    await createMomentFromTelegramAttachment({
      uri: 'ar://meta',
      name: 'My Moment',
      artistAddress: ARTIST_ADDRESS,
    });

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.token.mintToCreatorCount).toBe(1);
  });

  it('sets REFERRAL_RECIPIENT as createReferral', async () => {
    await createMomentFromTelegramAttachment({
      uri: 'ar://meta',
      name: 'My Moment',
      artistAddress: ARTIST_ADDRESS,
    });

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.token.createReferral).toBe('0xReferral');
  });

  it('sets channel to "telegram"', async () => {
    await createMomentFromTelegramAttachment({
      uri: 'ar://meta',
      name: 'My Moment',
      artistAddress: ARTIST_ADDRESS,
    });

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.channel).toBe('telegram');
  });
});
