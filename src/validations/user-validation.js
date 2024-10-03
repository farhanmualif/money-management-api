import { z } from 'zod';

export const userSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(3),
  last_name: z.string().min(3),
  total_balance: z.number().optional(),
  total_income: z.number().optional(),
  total_expenses: z.number().optional(),
});

export const userSignInSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
});
