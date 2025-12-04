import { z } from 'zod';
import { AlbumSchema } from './album';
import { TravelRecordSchema } from './travel-record';

export const CreateAlbumSchema = AlbumSchema.omit({
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});
export const UpdateAlbumSchema = AlbumSchema.omit({
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});

export const DeleteAlbumSchema = z.object({
  id: z.string(),
  year: z.string(),
});

export const CreateTagSchema = z.array(
  z.object({
    tag: z.string(),
  }),
);

export const LocationSearchSchema = z.object({
  textQuery: z.string().min(1),
});

export const CreateTravelRecordSchema = TravelRecordSchema.omit({
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});
export const UpdateTravelRecordSchema = TravelRecordSchema.omit({
  createdAt: true,
  createdBy: true,
  updatedAt: true,
  updatedBy: true,
});
