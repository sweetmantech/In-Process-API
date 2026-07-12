import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/media/readQuickTimeCreationDate', () => ({
  default: vi.fn(),
}));

import readQuickTimeCreationDate from '@/lib/media/readQuickTimeCreationDate';
import extractQuickTimeCaptureDate from '@/lib/telegram/chat/attachment/extractQuickTimeCaptureDate';

const mockRead = vi.mocked(readQuickTimeCreationDate);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('extractQuickTimeCaptureDate', () => {
  it('computes the UTC instant from a negative embedded offset', () => {
    mockRead.mockReturnValue('2026-06-17T12:30:03-0400');

    const result = extractQuickTimeCaptureDate(Buffer.from('mov-bytes'));

    expect(result).toBe(
      (Date.UTC(2026, 5, 17, 12, 30, 3) + 4 * 60 * 60_000) / 1000
    );
  });

  it('computes the UTC instant from a positive embedded offset', () => {
    mockRead.mockReturnValue('2026-06-17T12:30:03+09:00');

    const result = extractQuickTimeCaptureDate(Buffer.from('mov-bytes'));

    expect(result).toBe(
      (Date.UTC(2026, 5, 17, 12, 30, 3) - 9 * 60 * 60_000) / 1000
    );
  });

  it('handles a Z (UTC) offset', () => {
    mockRead.mockReturnValue('2026-06-17T12:30:03Z');

    const result = extractQuickTimeCaptureDate(Buffer.from('mov-bytes'));

    expect(result).toBe(Date.UTC(2026, 5, 17, 12, 30, 3) / 1000);
  });

  it('returns undefined when there is no creationdate atom', () => {
    mockRead.mockReturnValue(undefined);

    expect(
      extractQuickTimeCaptureDate(Buffer.from('mov-bytes'))
    ).toBeUndefined();
  });

  it('returns undefined when the value does not match the expected pattern', () => {
    mockRead.mockReturnValue('not-a-date');

    expect(
      extractQuickTimeCaptureDate(Buffer.from('mov-bytes'))
    ).toBeUndefined();
  });

  it('returns undefined when the atom parser throws (malformed box tree)', () => {
    mockRead.mockImplementation(() => {
      throw new RangeError('out of bounds');
    });

    expect(
      extractQuickTimeCaptureDate(Buffer.from('mov-bytes'))
    ).toBeUndefined();
  });
});
