import { z } from 'zod';

const uploadBodySchema = z.object({
  url: z.string(),
});

export default uploadBodySchema;
