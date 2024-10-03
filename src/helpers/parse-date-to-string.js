import { z } from 'zod';
import { BadRequestError } from '../errors/errors.js';

export const dateStringToDate = (bodyValueDate) => {
  if (bodyValueDate instanceof Date) return bodyValueDate;
  if (typeof bodyValueDate !== 'string')
    throw new BadRequestError(
      `Expected a string for date, but received ${typeof bodyValueDate}`
    );
  const parsed = new Date(bodyValueDate);
  // if (isNaN(parsed.getTime())) throw new Error('Invalid date string');
  return parsed;
};

export const dateSchema = z.preprocess(dateStringToDate, z.date());
