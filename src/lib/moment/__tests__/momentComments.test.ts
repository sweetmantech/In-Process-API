import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../supabase/in_process_moments/selectMoments', () => ({
  default: vi.fn(),
}));
vi.mock('../../supabase/in_process_moment_comments/selectComments', () => ({
  default: vi.fn(),
}));

import { momentComments } from '../momentComments';
import selectMoments from '../../supabase/in_process_moments/selectMoments';
import selectComments from '../../supabase/in_process_moment_comments/selectComments';

const mockSelectMoments = vi.mocked(selectMoments);
const mockSelectComments = vi.mocked(selectComments);

const validInput = {
  moment: {
    collectionAddress:
      '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
    tokenId: '1',
    chainId: 8453,
  },
  offset: 0,
};

describe('momentComments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns formatted comments', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [{ id: 'moment-1' }],
      error: null,
    } as any);
    mockSelectComments.mockResolvedValue([
      {
        id: 'comment-1',
        comment: 'Great track!',
        artist_address: '0xabc',
        wallet: { artist: { username: 'alice' } },
        commented_at: '2025-01-01T00:00:00Z',
      },
    ] as any);

    const result = await momentComments(validInput);

    expect(result).toEqual({
      comments: [
        {
          id: 'comment-1',
          comment: 'Great track!',
          sender: '0xabc',
          username: 'alice',
          timestamp: new Date('2025-01-01T00:00:00Z').getTime(),
        },
      ],
    });
  });

  it('defaults comment to empty string when null', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [{ id: 'moment-1' }],
      error: null,
    } as any);
    mockSelectComments.mockResolvedValue([
      {
        id: 'c1',
        comment: null,
        artist_address: '0xabc',
        wallet: { artist: { username: 'alice' } },
        commented_at: null,
      },
    ] as any);

    const result = await momentComments(validInput);
    expect(result.comments[0].comment).toBe('');
    expect(result.comments[0].timestamp).toBe(0);
  });

  it('defaults username to empty string when null', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [{ id: 'moment-1' }],
      error: null,
    } as any);
    mockSelectComments.mockResolvedValue([
      {
        id: 'c1',
        comment: 'Hi',
        artist_address: '0xabc',
        wallet: { artist: { username: null } },
        commented_at: null,
      },
    ] as any);

    const result = await momentComments(validInput);
    expect(result.comments[0].username).toBe('');
  });

  it('throws when selectMoments returns error', async () => {
    mockSelectMoments.mockResolvedValue({
      data: null,
      error: { message: 'db error' },
    } as any);
    await expect(momentComments(validInput)).rejects.toThrow(
      'Failed to get moments'
    );
  });

  it('throws when moment is not found', async () => {
    mockSelectMoments.mockResolvedValue({ data: [], error: null } as any);
    await expect(momentComments(validInput)).rejects.toThrow(
      'Moment not found'
    );
  });

  it('passes offset to selectComments', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [{ id: 'moment-1' }],
      error: null,
    } as any);
    mockSelectComments.mockResolvedValue([] as any);

    await momentComments({ ...validInput, offset: 10 });
    expect(mockSelectComments).toHaveBeenCalledWith({
      momentId: 'moment-1',
      offset: 10,
    });
  });
});
