import { z } from 'zod';

export const ResponseStatusSchema = z.object({
  code: z.number(),
  status: z.string(),
  message: z.string().optional(),
});

export const ApiResponseSchema = z.object({
  code: z.number(),
  status: z.string(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type ResponseStatus = z.infer<typeof ResponseStatusSchema>;
export type ApiResponse<T> = z.infer<typeof ApiResponseSchema> & { data?: T };
