import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_messages/selectMessages', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/messages/getMomentFromMessage', () => ({ default: vi.fn() }));
vi.mock('@/lib/supabase/in_process_moments/selectMoments', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_message_moment/upsertMessageMoment', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/messages/formatMessages', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({ CHAIN_ID: 8453 }));

import indexMomentHandler from '../indexMomentHandler';
import selectMessage from '@/lib/supabase/in_process_messages/selectMessages';
import getMomentFromMessage from '@/lib/messages/getMomentFromMessage';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import upsertMessageMoment from '@/lib/supabase/in_process_message_moment/upsertMessageMoment';
import formatMessages from '@/lib/messages/formatMessages';

const mockSelectMessage = vi.mocked(selectMessage);
const mockGetMomentFromMessage = vi.mocked(getMomentFromMessage);
const mockSelectMoments = vi.mocked(selectMoments);
const mockUpsertMessageMoment = vi.mocked(upsertMessageMoment);
const mockFormatMessages = vi.mocked(formatMessages);

const mockMessage = { id: 'msg-1', body: 'some text' };
const mockMomentInfo = {
  collectionAddress: '0xcol' as `0x${string}`,
  tokenId: '1',
};
const mockMoment = { id: 'moment-1', token_id: '1' };
const mockMessageMoment = { id: 'mm-1', moment: 'moment-1', message: 'msg-1' };

describe('indexMomentHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when message is not found', async () => {
    mockSelectMessage.mockResolvedValue({ data: [] } as any);
    mockFormatMessages.mockReturnValue([]);

    const res = await indexMomentHandler('msg-1');
    expect(res.status).toBe(404);
  });

  it('returns 404 when formatted message is empty', async () => {
    mockSelectMessage.mockResolvedValue({ data: [{}] } as any);
    mockFormatMessages.mockReturnValue([]);

    const res = await indexMomentHandler('msg-1');
    expect(res.status).toBe(404);
  });

  it('returns 400 when message is not a moment message', async () => {
    mockSelectMessage.mockResolvedValue({ data: [{}] } as any);
    mockFormatMessages.mockReturnValue([mockMessage] as any);
    mockGetMomentFromMessage.mockReturnValue(null);

    const res = await indexMomentHandler('msg-1');
    expect(res.status).toBe(400);
  });

  it('returns 404 when moment is not found in DB', async () => {
    mockSelectMessage.mockResolvedValue({ data: [{}] } as any);
    mockFormatMessages.mockReturnValue([mockMessage] as any);
    mockGetMomentFromMessage.mockReturnValue(mockMomentInfo);
    mockSelectMoments.mockResolvedValue({ data: [], error: null } as any);

    const res = await indexMomentHandler('msg-1');
    expect(res.status).toBe(404);
  });

  it('returns 500 when upsert fails', async () => {
    mockSelectMessage.mockResolvedValue({ data: [{}] } as any);
    mockFormatMessages.mockReturnValue([mockMessage] as any);
    mockGetMomentFromMessage.mockReturnValue(mockMomentInfo);
    mockSelectMoments.mockResolvedValue({
      data: [mockMoment],
      error: null,
    } as any);
    mockUpsertMessageMoment.mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const res = await indexMomentHandler('msg-1');
    expect(res.status).toBe(500);
  });

  it('returns 200 with messageMoment on success', async () => {
    mockSelectMessage.mockResolvedValue({ data: [{}] } as any);
    mockFormatMessages.mockReturnValue([mockMessage] as any);
    mockGetMomentFromMessage.mockReturnValue(mockMomentInfo);
    mockSelectMoments.mockResolvedValue({
      data: [mockMoment],
      error: null,
    } as any);
    mockUpsertMessageMoment.mockResolvedValue({
      data: mockMessageMoment,
      error: null,
    } as any);

    const res = await indexMomentHandler('msg-1');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, messageMoment: mockMessageMoment });
  });
});
