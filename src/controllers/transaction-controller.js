import { prisma } from '../config/db.js';

export default class TransactionController {
  static async get(req, res, next) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          accountId: res.account.id,
        },
      });
      res.status(201).json({
        status: true,
        message: 'Account created successfully',
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          accountId: res.account.id,
          id: req.params.id,
        },
        include: {
          account: {
            select: {
              Expenses: true,
            },
          },
        },
      });
      res.status(200).json({
        status: true,
        message: 'Account created successfully',
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}
