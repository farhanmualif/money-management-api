import { z } from 'zod';
import parsePhoneNumber from 'libphonenumber-js';

export const zPhoneNumber = z.string().transform((value, ctx) => {
  const phoneNumber = parsePhoneNumber(value, {
    defaultCountry: 'FI',
  });

  if (!phoneNumber?.isValid()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid phone number',
    });
    return z.NEVER;
  }

  return phoneNumber.formatInternational();
});

export const userSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  phone_number: zPhoneNumber, // phone validation
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
