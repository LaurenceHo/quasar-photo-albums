import { PlaceSchema } from '@/schema/place';
import { z } from 'zod';

export const TravelRecordSchema = z.object({
  id: z.string(),
  travelDate: z.string(),
  departure: PlaceSchema.optional(),
  destination: PlaceSchema.optional(),
  transportType: z.enum(['flight', 'bus', 'train']),
  flightNumber: z.string().optional(),
  distance: z.number().optional(),
});

export type TravelRecord = z.infer<typeof TravelRecordSchema>;
