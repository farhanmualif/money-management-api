import { z } from 'zod';
import { prisma } from '../config/db.js'; // pastikan path ini benar
import { UnauthorizedError } from '../errors/errors.js';

export async function authenticated(req, res, next) {
  const headerSchema = z.object({
    authorization: z.string().refine((val) => val.startsWith('Bearer '), {
      message: 'Authorization header must start with Bearer',
    }),
  });

  try {
    const headers = headerSchema.parse(req.headers);
    const token = headers.authorization.split(' ')[1];

    const findToken = await prisma.token.findUnique({
      where: {
        token,
      },
      include: {
        Accounts: true,
      },
    });

    if (!findToken || !findToken.Accounts) {
      throw new UnauthorizedError('Silahkan login terlebih dahulu');
    }
    delete findToken.Accounts.password;
    res.account = findToken.Accounts;

    next();
  } catch (error) {
    next(error);
  }
}
