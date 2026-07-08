import { z } from 'zod';

const telegramEmailSchema = z.string().trim().email();

export default telegramEmailSchema;
