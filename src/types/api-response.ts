import { AlbumSchema } from 'src/types/album';
import { PhotoSchema } from 'src/types/photo';
import { z } from 'zod';

const PhotoResponseSchema = z.object({
  photos: z.array(PhotoSchema),
  album: AlbumSchema,
});

const ResponseStatusSchema = z.object({
  code: z.number(),
  status: z.string(),
  message: z.string().optional(),
});

const ApiResponseSchema = ResponseStatusSchema.extend({
  data: z.any().optional(),
});

export type ResponseStatus = z.infer<typeof ResponseStatusSchema>;
export type ApiResponse<T> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type PhotoResponse = z.infer<typeof PhotoResponseSchema>;
