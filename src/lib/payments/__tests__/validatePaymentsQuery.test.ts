import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import validatePaymentsQuery from '@/lib/payments/validatePaymentsQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/payments');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validatePaymentsQuery', () => {
  describe('mime (audioOnly / content_type)', () => {
    it('returns undefined mime when neither audioOnly nor content_type provided', () => {
      const result = validatePaymentsQuery(makeRequest());
      expect((result as any).mime).toBeUndefined();
    });

    it('returns "audio/%" when audioOnly=true', () => {
      const result = validatePaymentsQuery(makeRequest({ audioOnly: 'true' }));
      expect((result as any).mime).toBe('audio/%');
    });

    it('returns "video/%" when content_type=video', () => {
      const result = validatePaymentsQuery(
        makeRequest({ content_type: 'video' })
      );
      expect((result as any).mime).toBe('video/%');
    });

    it('returns "image/%" when content_type=image', () => {
      const result = validatePaymentsQuery(
        makeRequest({ content_type: 'image' })
      );
      expect((result as any).mime).toBe('image/%');
    });

    it('audioOnly=true takes priority over content_type', () => {
      const result = validatePaymentsQuery(
        makeRequest({ audioOnly: 'true', content_type: 'video' })
      );
      expect((result as any).mime).toBe('audio/%');
    });

    it('returns undefined mime when audioOnly=false and content_type not provided', () => {
      const result = validatePaymentsQuery(makeRequest({ audioOnly: 'false' }));
      expect((result as any).mime).toBeUndefined();
    });
  });

  describe('defaults', () => {
    it('defaults limit to 20', () => {
      const result = validatePaymentsQuery(makeRequest());
      expect((result as any).limit).toBe(20);
    });

    it('caps limit at 100', () => {
      const result = validatePaymentsQuery(makeRequest({ limit: '200' }));
      expect((result as any).limit).toBe(100);
    });

    it('defaults page to 1', () => {
      const result = validatePaymentsQuery(makeRequest());
      expect((result as any).page).toBe(1);
    });

    it('returns undefined for optional params when not provided', () => {
      const result = validatePaymentsQuery(makeRequest());
      expect((result as any).artist).toBeUndefined();
      expect((result as any).collector).toBeUndefined();
      expect((result as any).chainId).toBeUndefined();
    });
  });

  describe('param parsing', () => {
    it('parses artist param', () => {
      const result = validatePaymentsQuery(makeRequest({ artist: '0xartist' }));
      expect((result as any).artist).toBe('0xartist');
    });

    it('parses collector param', () => {
      const result = validatePaymentsQuery(
        makeRequest({ collector: '0xcollector' })
      );
      expect((result as any).collector).toBe('0xcollector');
    });

    it('parses chainId as number', () => {
      const result = validatePaymentsQuery(makeRequest({ chainId: '8453' }));
      expect((result as any).chainId).toBe(8453);
    });

    it('parses page as number', () => {
      const result = validatePaymentsQuery(makeRequest({ page: '3' }));
      expect((result as any).page).toBe(3);
    });

    it('parses limit as number', () => {
      const result = validatePaymentsQuery(makeRequest({ limit: '50' }));
      expect((result as any).limit).toBe(50);
    });
  });
});
