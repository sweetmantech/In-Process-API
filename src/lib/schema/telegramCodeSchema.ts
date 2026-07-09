import { z } from 'zod';

const telegramCodeSchema = z
  .string()
  .trim()
  .length(6)
  .regex(/^\d{6}$/);

export default telegramCodeSchema;
