import { z } from 'zod';
import { PlaceSchema } from './place';

export const AlbumSchema = z.object({
  id: z.string(),
  year: z.string(),
  albumName: z.string(),
  description: z.string().optional(),
  albumCover: z.string().optional(),
  isPrivate: z.boolean(),
  isFeatured: z.boolean().optional(),
  place: PlaceSchema.optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

export const AlbumTagSchema = z.object({
  tag: z.string(),
  createdAt: z.string(),
  createdBy: z.string(),
});

export const AlbumTagsMapSchema = z.object({
  albumId: z.string(),
  tag: z.string(),
});

export type Album = z.infer<typeof AlbumSchema>;
export type AlbumTag = z.infer<typeof AlbumTagSchema>;
export type AlbumTagsMap = z.infer<typeof AlbumTagsMapSchema>;
export type AlbumsByYear = { year: string; count: number }[];