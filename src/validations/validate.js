import z from 'zod';
import { prisma } from '../config/db.js';
import { UnauthorizedError } from '../errors/errors.js';
import { dateSchema } from '../helpers/parse-date-to-string.js';

export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateWithToken(bodySchema) {
  const headerSchema = z.object({
    authorization: z.string().startsWith('Bearer '),
  });

  const bodyWithDateSchema = bodySchema.extend({
    created_at: dateSchema.optional(),
    updated_at: dateSchema.optional(),
    created_date: dateSchema.optional(),
    date: dateSchema.optional(),
  });

  return async function (req, res, next) {
    try {
      const headers = headerSchema.parse(req.headers);
      const token = headers.authorization.split(' ')[1];

      const findToken = await prisma.token.findUnique({
        where: {
          token,
        },
        include: {
          Accounts: true
        },
      });


      if (!findToken) {
        throw new UnauthorizedError('Silahkan login terlebih dahulu');
      }

      if (findToken.Accounts == undefined) {
        throw new UnauthorizedError('Silahkan login terlebih dahulu');
      }

      bodyWithDateSchema.parse(req.body);

      delete findToken.Accounts.password;
      // inject account
      res.account = findToken.Accounts;

      next();
    } catch (error) {
      next(error);
    }
  };
}
