import { z } from 'zod';

const hideMomentSchema = z.object({
  momentId: z.uuid(),
});

export default hideMomentSchema;
