import { z } from 'zod';
import { dateSchema } from '../helpers/parse-date-to-string.js';

export const createIncomeResourceSchema = z.object({
  amount: z.number(),
  frequency: z.string(),
  isRecurring: z.boolean(),
  name: z.string(),
  date: dateSchema,
});
