import { z } from 'zod';

const artistWalletsQuerySchema = z.object({
  artistId: z.uuid(),
});

export default artistWalletsQuerySchema;
