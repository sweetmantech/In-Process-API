import type { Address } from 'viem';

export interface PendingMediaState {
  fileId: string;
  thumbFileId?: string;
  attachmentType: 'image' | 'video';
  attachmentSize?: number;
  artistAddress: Address;
}

export interface TelegramThreadState extends Record<string, unknown> {
  pendingMedia?: PendingMediaState | null;
}
