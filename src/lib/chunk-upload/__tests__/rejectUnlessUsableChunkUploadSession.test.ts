import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';
import rejectUnlessUsableChunkUploadSession from '@/lib/chunk-upload/rejectUnlessUsableChunkUploadSession';

const baseSession = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  status: 'open' as const,
  expires_at: new Date(Date.now() + 60_000).toISOString(),
  artist_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  total_chunks: 3,
};

describe('rejectUnlessUsableChunkUploadSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 404 when fetch error is truthy', () => {
    const r = rejectUnlessUsableChunkUploadSession(
      baseSession,
      new Error('db'),
      baseSession.artist_address
    );
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected failure');
    expect(r.response).toBeInstanceOf(NextResponse);
    expect(r.response.status).toBe(404);
  });

  it('returns 404 when session is null', () => {
    const r = rejectUnlessUsableChunkUploadSession(
      null,
      null,
      baseSession.artist_address
    );
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected failure');
    expect(r.response.status).toBe(404);
  });

  it('returns 400 when status is not open', () => {
    const r = rejectUnlessUsableChunkUploadSession(
      { ...baseSession, status: 'completing' },
      null,
      baseSession.artist_address
    );
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected failure');
    expect(r.response.status).toBe(400);
  });

  it('returns 410 when session is expired', () => {
    const r = rejectUnlessUsableChunkUploadSession(
      {
        ...baseSession,
        expires_at: new Date('2026-01-15T11:59:59.000Z').toISOString(),
      },
      null,
      baseSession.artist_address
    );
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected failure');
    expect(r.response.status).toBe(410);
  });

  it('returns 403 when artist does not match (case-insensitive)', () => {
    const r = rejectUnlessUsableChunkUploadSession(
      baseSession,
      null,
      '0x0000000000000000000000000000000000000001'
    );
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected failure');
    expect(r.response.status).toBe(403);
  });

  it('allows same address with different casing', () => {
    const r = rejectUnlessUsableChunkUploadSession(
      {
        ...baseSession,
        artist_address: baseSession.artist_address.toUpperCase(),
      },
      null,
      baseSession.artist_address.toLowerCase()
    );
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error('expected success');
    expect(r.session.id).toBe(baseSession.id);
  });

  it('returns session when usable', () => {
    const r = rejectUnlessUsableChunkUploadSession(
      baseSession,
      null,
      baseSession.artist_address
    );
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error('expected success');
    expect(r.session).toEqual(baseSession);
  });
});
