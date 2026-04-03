import { z } from 'zod';
import { updateCollectionBaseSchema } from './updateCollectionBaseSchema';

export const updateSoundTierMetadataSchema = updateCollectionBaseSchema.extend({
  tier: z.number().int().min(0).max(255),
});
