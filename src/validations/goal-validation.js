import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
});
