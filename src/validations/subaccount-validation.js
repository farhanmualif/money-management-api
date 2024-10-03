import { z } from 'zod';
import { dateSchema } from '../helpers/parse-date-to-string.js';

export const createSubaccountSchema = z.object({
  name: z.string(),
  amount: z.number(),
  created_date: dateSchema,
  account_type: z.string(),
});
