import { z } from 'zod';

/** Accepts JSON strings/numbers and already-parsed bigint (e.g. from another Zod parse). */
const bigIntString = z
  .union([z.string(), z.number(), z.bigint()])
  .transform((val) => (typeof val === 'bigint' ? val : BigInt(val)));
export default bigIntString;
