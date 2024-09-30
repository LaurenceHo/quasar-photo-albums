import { z } from 'zod';

export const UploadFileSchema = z.object({
  id: z.string(),
  file: z.instanceof(File),
  url: z.string(),
  status: z.union([z.literal('loading'), z.boolean(), z.null()]),
  exists: z.boolean()
});

export type UploadFile = z.infer<typeof UploadFileSchema>;
