import { z } from 'zod';
import { momentSchema } from '@/lib/schema/momentSchema';

const hideMomentSchema = z.object({
  moment: momentSchema,
});

export default hideMomentSchema;
