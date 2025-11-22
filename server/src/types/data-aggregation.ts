import { z } from 'zod';

export const DataAggregationSchema = z.object({
  key: z.string(),
  value: z.string(),
  updatedAt: z.string(),
});

export type DataAggregation = z.infer<typeof DataAggregationSchema>;
