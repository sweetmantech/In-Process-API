import { describe, it, expect } from 'vitest';
import getChannelFromReqHeader from '@/lib/moment/getChannelFromReqHeader';

const makeReq = (origin?: string) =>
  ({
    headers: {
      get: (key: string) => (key === 'origin' ? (origin ?? null) : null),
    },
  }) as any;

describe('getChannelFromReqHeader', () => {
  it('returns "web" for inprocess.world origin', () => {
    expect(getChannelFromReqHeader(makeReq('https://inprocess.world'))).toBe(
      'web'
    );
  });

  it('returns "web" for stayinprocess.vercel.app origin', () => {
    expect(
      getChannelFromReqHeader(makeReq('https://stayinprocess.vercel.app'))
    ).toBe('web');
  });

  it('returns "api" for an unknown origin', () => {
    expect(getChannelFromReqHeader(makeReq('https://other.com'))).toBe('api');
  });

  it('returns "api" when origin header is absent', () => {
    expect(getChannelFromReqHeader(makeReq())).toBe('api');
  });
});
