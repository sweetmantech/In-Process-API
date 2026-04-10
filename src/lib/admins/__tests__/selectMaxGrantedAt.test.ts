import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_admins/selectMax', () => ({
  selectMax: vi.fn(),
}));

import { selectMaxGrantedAt } from '../selectMaxGrantedAt';
import { selectMax } from '@/lib/supabase/in_process_admins/selectMax';

const mockSelectMax = vi.mocked(selectMax);

describe('selectMaxGrantedAt', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when selectMax returns null', async () => {
    mockSelectMax.mockResolvedValue(null);
    expect(await selectMaxGrantedAt()).toBeNull();
  });

  it('returns null when selectMax returns empty string', async () => {
    mockSelectMax.mockResolvedValue('');
    expect(await selectMaxGrantedAt()).toBeNull();
  });

  it('converts ISO string to milliseconds timestamp', async () => {
    mockSelectMax.mockResolvedValue('2023-11-14T22:13:20.000Z');
    const result = await selectMaxGrantedAt();
    expect(result).toBe(new Date('2023-11-14T22:13:20.000Z').getTime());
  });

  it('calls selectMax with granted_at', async () => {
    mockSelectMax.mockResolvedValue(null);
    await selectMaxGrantedAt();
    expect(mockSelectMax).toHaveBeenCalledWith('granted_at');
  });
});
