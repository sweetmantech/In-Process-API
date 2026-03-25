import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import validateTimelineQuery from '@/lib/timeline/validateTimelineQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/timeline');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateTimelineQuery', () => {
  describe('mime (content_type / audioOnly)', () => {
    it('returns undefined mime when neither audioOnly nor content_type provided', () => {
      const result = validateTimelineQuery(makeRequest());
      expect((result as any).mime).toBeUndefined();
    });

    it('returns "audio/%" when audioOnly=true', () => {
      const result = validateTimelineQuery(makeRequest({ audioOnly: 'true' }));
      expect((result as any).mime).toBe('audio/%');
    });

    it('returns "video/%" when content_type=video', () => {
      const result = validateTimelineQuery(
        makeRequest({ content_type: 'video' })
      );
      expect((result as any).mime).toBe('video/%');
    });

    it('returns "image/%" when content_type=image', () => {
      const result = validateTimelineQuery(
        makeRequest({ content_type: 'image' })
      );
      expect((result as any).mime).toBe('image/%');
    });

    it('audioOnly=true takes priority over content_type', () => {
      const result = validateTimelineQuery(
        makeRequest({ audioOnly: 'true', content_type: 'video' })
      );
      expect((result as any).mime).toBe('audio/%');
    });

    it('returns undefined mime when audioOnly=false and content_type not provided', () => {
      const result = validateTimelineQuery(makeRequest({ audioOnly: 'false' }));
      expect((result as any).mime).toBeUndefined();
    });
  });

  describe('defaults', () => {
    it('defaults limit to 100', () => {
      const result = validateTimelineQuery(makeRequest());
      expect((result as any).limit).toBe(100);
    });

    it('caps limit at 100', () => {
      const result = validateTimelineQuery(makeRequest({ limit: '200' }));
      expect((result as any).limit).toBe(100);
    });

    it('defaults page to 1', () => {
      const result = validateTimelineQuery(makeRequest());
      expect((result as any).page).toBe(1);
    });

    it('returns undefined for optional params when not provided', () => {
      const result = validateTimelineQuery(makeRequest());
      expect((result as any).collection).toBeUndefined();
      expect((result as any).artist).toBeUndefined();
      expect((result as any).period).toBeUndefined();
      expect((result as any).channel).toBeUndefined();
      expect((result as any).type).toBeUndefined();
    });

    it('defaults hidden to false', () => {
      const result = validateTimelineQuery(makeRequest());
      expect((result as any).hidden).toBe(false);
    });
  });

  describe('type param', () => {
    it('accepts "mutual"', () => {
      const result = validateTimelineQuery(makeRequest({ type: 'mutual' }));
      expect((result as any).type).toBe('mutual');
    });

    it('accepts "default"', () => {
      const result = validateTimelineQuery(makeRequest({ type: 'default' }));
      expect((result as any).type).toBe('default');
    });

    it('returns 400 for invalid type', async () => {
      const { NextResponse } = await import('next/server');
      const result = validateTimelineQuery(makeRequest({ type: 'invalid' }));
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });
});
