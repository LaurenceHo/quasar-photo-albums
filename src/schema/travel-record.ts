import { PlaceSchema } from '@/schema/place';
import { z } from 'zod';

export const TravelRecordSchema = z.object({
  id: z.string(),
  travelDate: z.string(),
  departure: PlaceSchema.optional().nullable(),
  destination: PlaceSchema.optional().nullable(),
});

export type TravelRecord = z.infer<typeof TravelRecordSchema>;
