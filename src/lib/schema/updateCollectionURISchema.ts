import { z } from 'zod';
import { updateCollectionBaseSchema } from './updateCollectionBaseSchema';

export const updateCollectionURISchema = updateCollectionBaseSchema.extend({
  newCollectionName: z.string().min(1, 'Collection name is required'),
});
