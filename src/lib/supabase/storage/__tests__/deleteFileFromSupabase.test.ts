import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRemove = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({ remove: mockRemove })),
    },
  },
}));

vi.mock('@/lib/consts', () => ({
  SUPABASE_STORAGE_BUCKET: 'in_process_files',
}));

import deleteFileFromSupabase from '../deleteFileFromSupabase';
import { supabase } from '@/lib/supabase/client';

const mockFrom = vi.mocked(supabase.storage.from);

const SUPABASE_URL =
  'https://zzgteesackezhtnuqfyw.supabase.co/storage/v1/object/public/in_process_files/9db44f04-2bf9-4daf-9d97-b4415e28ffd4.jpeg';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('deleteFileFromSupabase', () => {
  it('extracts path and calls remove with it', async () => {
    mockRemove.mockResolvedValue({ error: null });

    await deleteFileFromSupabase(SUPABASE_URL);

    expect(mockFrom).toHaveBeenCalledWith('in_process_files');
    expect(mockRemove).toHaveBeenCalledWith([
      '9db44f04-2bf9-4daf-9d97-b4415e28ffd4.jpeg',
    ]);
  });

  it('skips non-Supabase URLs without calling remove', async () => {
    await deleteFileFromSupabase('https://stream.mux.com/abc123.m3u8');

    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('throws when supabase returns an error', async () => {
    mockRemove.mockResolvedValue({ error: { message: 'Not found' } });

    await expect(deleteFileFromSupabase(SUPABASE_URL)).rejects.toThrow(
      'Supabase delete failed: Not found'
    );
  });
});
