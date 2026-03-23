import { z } from 'zod';

const fileIdSchema = z.string().superRefine((val, ctx) => {
  if (!val.trim()) {
    ctx.addIssue({ code: 'custom', message: 'fileId must not be empty' });
  }
});

export default fileIdSchema;
