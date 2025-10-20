import { z } from 'zod';

export const AlbumSchema = z.object({
  id: z.string(),
  year: z.string(),
  albumName: z.string(),
  description: z.string().optional(),
  albumCover: z.string().optional(),
  isPrivate: z.boolean(),
  isFeatured: z.boolean().optional(),
  place: z.string().optional(),
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

export const TravelRecordSchema = z.object({
  id: z.string(),
  travelDate: z.string(),
  departure: z.string().optional(),
  destination: z.string().optional(),
  transportType: z.enum(['flight', 'bus', 'train']),
  flightNumber: z.string().optional(),
  distance: z.number().optional(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

export const UserPermissionSchema = z.object({
  uid: z.string(),
  email: z.string(),
  displayName: z.string(),
  role: z.string(),
});

export const DataAggregationSchema = z.object({
  key: z.string(),
  value: z.string(),
  updatedAt: z.string(),
});

export type Album = z.infer<typeof AlbumSchema>;
export type AlbumTag = z.infer<typeof AlbumTagSchema>;
export type AlbumTagsMap = z.infer<typeof AlbumTagsMapSchema>;
export type TravelRecord = z.infer<typeof TravelRecordSchema>;
export type UserPermission = z.infer<typeof UserPermissionSchema>;
export type DataAggregation = z.infer<typeof DataAggregationSchema>;
