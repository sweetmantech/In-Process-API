import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDeleteFileFromSupabase } = vi.hoisted(() => ({
  mockDeleteFileFromSupabase: vi.fn(),
}));

vi.mock('@/lib/supabase/storage/deleteFileFromSupabase', () => ({
  default: mockDeleteFileFromSupabase,
}));

import deleteSupabaseFilesStep from '../deleteSupabaseFilesStep';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('deleteSupabaseFilesStep', () => {
  it('calls deleteFileFromSupabase for each url', async () => {
    mockDeleteFileFromSupabase.mockResolvedValue(undefined);

    const urls = [
      'https://zzgteesackezhtnuqfyw.supabase.co/storage/v1/object/public/in_process_files/a.jpeg',
      'https://zzgteesackezhtnuqfyw.supabase.co/storage/v1/object/public/in_process_files/b.json',
    ];

    await deleteSupabaseFilesStep(urls);

    expect(mockDeleteFileFromSupabase).toHaveBeenCalledTimes(2);
    expect(mockDeleteFileFromSupabase).toHaveBeenCalledWith(urls[0]);
    expect(mockDeleteFileFromSupabase).toHaveBeenCalledWith(urls[1]);
  });

  it('handles empty array without error', async () => {
    await expect(deleteSupabaseFilesStep([])).resolves.toBeUndefined();
    expect(mockDeleteFileFromSupabase).not.toHaveBeenCalled();
  });

  it('throws if any delete fails', async () => {
    mockDeleteFileFromSupabase.mockRejectedValue(
      new Error('Supabase delete failed: Not found')
    );

    await expect(
      deleteSupabaseFilesStep([
        'https://zzgteesackezhtnuqfyw.supabase.co/storage/v1/object/public/in_process_files/a.jpeg',
      ])
    ).rejects.toThrow('Supabase delete failed: Not found');
  });
});
