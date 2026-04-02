import { z } from 'zod';
import { CHAIN_ID } from '../consts';

const chainIdSchema = z.coerce.number().optional().default(CHAIN_ID);

export default chainIdSchema;
