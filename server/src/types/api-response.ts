import { z } from 'zod';
import { Album } from './album';
import { PhotoSchema } from './photo';

export const PhotoResponseSchema = z.object({
  photos: z.array(PhotoSchema),
  album: z.custom<Album>(),
});

export const PhotosRequestSchema = z.object({
  albumId: z.string(),
  destinationAlbumId: z.string().optional(),
  photoKeys: z.array(z.string()),
});

export const RenamePhotoRequestSchema = z.object({
  albumId: z.string(),
  newPhotoKey: z.string(),
  currentPhotoKey: z.string(),
});

const ResponseStatusSchema = z.object({
  code: z.number(),
  status: z.string(),
  message: z.string().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ApiResponseSchema = ResponseStatusSchema.extend({
  data: z.any().optional(),
});

export type RenamePhotoRequest = z.infer<typeof RenamePhotoRequestSchema>;
export type PhotosRequest = z.infer<typeof PhotosRequestSchema>;
export type PhotoResponse = z.infer<typeof PhotoResponseSchema>;
export type ResponseStatus = z.infer<typeof ResponseStatusSchema>;
export type ApiResponse<T> = z.infer<typeof ApiResponseSchema> & { data?: T };
