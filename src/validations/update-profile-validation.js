import { z } from 'zod';

export const updateProfileValidation = z.object({
  email: z.string(),
  phoneNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});
