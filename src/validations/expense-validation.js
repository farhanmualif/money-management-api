import { z } from 'zod';
import { dateSchema } from '../helpers/parse-date-to-string.js';

export const createExpenseSchema = z.object({
  name: z.string().min(2),
  amount: z.number(),
  payment_method: z.string(),
  isRequring: z.boolean(),
  frequency: z.string(),
  date: dateSchema,
});
