import { PlaceSchema } from '@/schema/place';
import { z } from 'zod';

export const TravelRecordSchema = z.object({
  id: z.string(),
  travelDate: z.string().date(),
  departure: PlaceSchema.required(),
  destination: PlaceSchema.required(),
});

export type TravelRecord = z.infer<typeof TravelRecordSchema>;
