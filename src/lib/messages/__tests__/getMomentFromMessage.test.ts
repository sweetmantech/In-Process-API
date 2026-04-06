import { describe, it, expect } from 'vitest';
import getMomentFromMessage from '@/lib/messages/getMomentFromMessage';

const CONTRACT = '0xAbCd1234567890AbCd1234567890AbCd12345678';

const makeMessage = (text: string) =>
  ({ parts: [{ type: 'text', text }] }) as any;

describe('getMomentFromMessage', () => {
  it('matches a /sms/ URL on base chain', () => {
    const result = getMomentFromMessage(
      makeMessage(
        `Moment created, ready for editing at https://inprocess.world/sms/base:${CONTRACT}/42`
      )
    );
    expect(result).toEqual({
      collectionAddress: CONTRACT.toLowerCase(),
      tokenId: '42',
    });
  });

  it('matches a /collect/ URL on base chain', () => {
    const result = getMomentFromMessage(
      makeMessage(
        `Moment created, ready for editing at https://inprocess.world/collect/base:${CONTRACT}/7`
      )
    );
    expect(result).toEqual({
      collectionAddress: CONTRACT.toLowerCase(),
      tokenId: '7',
    });
  });

  it('matches a /sms/ URL on bsep (testnet)', () => {
    const result = getMomentFromMessage(
      makeMessage(
        `Moment created, ready for editing at https://inprocess.world/sms/bsep:${CONTRACT}/1`
      )
    );
    expect(result).toEqual({
      collectionAddress: CONTRACT.toLowerCase(),
      tokenId: '1',
    });
  });

  it('matches a /collect/ URL on bsep (testnet)', () => {
    const result = getMomentFromMessage(
      makeMessage(
        `Moment created, ready for editing at https://inprocess.world/collect/bsep:${CONTRACT}/3`
      )
    );
    expect(result).toEqual({
      collectionAddress: CONTRACT.toLowerCase(),
      tokenId: '3',
    });
  });

  it('returns null for an unrecognized path', () => {
    const result = getMomentFromMessage(
      makeMessage(
        `Moment created, ready for editing at https://inprocess.world/unknown/base:${CONTRACT}/1`
      )
    );
    expect(result).toBeNull();
  });

  it('returns null when parts is null', () => {
    expect(getMomentFromMessage({ parts: null } as any)).toBeNull();
  });

  it('returns null for a non-text part', () => {
    const result = getMomentFromMessage({
      parts: [
        { type: 'file', url: `https://inprocess.world/sms/base:${CONTRACT}/1` },
      ],
    } as any);
    expect(result).toBeNull();
  });
});
