import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_moment_comments/selectMax', () => ({
  selectMax: vi.fn(),
}));

import { selectMaxCommentedAt } from '../selectMaxCommentedAt';
import { selectMax } from '@/lib/supabase/in_process_moment_comments/selectMax';

const mockSelectMax = vi.mocked(selectMax);

describe('selectMaxCommentedAt', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when selectMax returns null', async () => {
    mockSelectMax.mockResolvedValue(null);
    expect(await selectMaxCommentedAt()).toBeNull();
  });

  it('converts ISO string to milliseconds', async () => {
    mockSelectMax.mockResolvedValue('2023-01-01T00:00:00.000Z');
    const result = await selectMaxCommentedAt();
    expect(result).toBe(new Date('2023-01-01T00:00:00.000Z').getTime());
  });

  it('calls selectMax with commented_at', async () => {
    mockSelectMax.mockResolvedValue(null);
    await selectMaxCommentedAt();
    expect(mockSelectMax).toHaveBeenCalledWith('commented_at');
  });
});
