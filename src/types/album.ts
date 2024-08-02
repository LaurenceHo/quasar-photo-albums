import { PlaceSchema } from 'src/types/place';
import { z } from 'zod';

export const AlbumSchema = z.object({
  year: z.string(),
  id: z.string(),
  albumName: z.string(),
  albumCover: z.string().optional(),
  description: z.string().optional(),
  isPrivate: z.boolean(),
  isFeatured: z.boolean().optional().nullable(),
  tags: z.array(z.string()).optional(),
  place: PlaceSchema.optional(),
});

export const AlbumTagSchema = z.object({
  tag: z.string(),
});

export type AlbumTag = z.infer<typeof AlbumTagSchema>;
export type Album = z.infer<typeof AlbumSchema>;
