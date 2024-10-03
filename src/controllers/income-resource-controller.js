import { prisma } from '../config/db.js';
import { NotFoundError } from '../errors/errors.js';

export default class IncomeRecourceController {
  static async create(req, res, next) {
    const { amount, frequency, isRecurring, name, date } = req.body;
    try {
      const createIncomeResource = await prisma.incomeResources.create({
        data: {
          name: name,
          amount: amount,
          isRecurring: isRecurring,
          frequency: frequency,
          account_id: res.account.id,
          date: new Date(date),
        },
      });

      res.status(201).json({
        status: true,
        message: 'add Income Source Successfully',
        data: createIncomeResource,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req, res, next) {
    try {
      const expanses = await prisma.incomeResources.findMany({
        where: {
          account_id: res.account.id,
        },
      });
      res.status(200).json({
        status: true,
        message: 'Get Income Sources Successfully',
        data: expanses,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const expanses = await prisma.incomeResources.findFirst({
        where: {
          id: req.params.id,
          account_id: res.account.id,
        },
      });

      res.status(200).json({
        status: true,
        message: 'Get Income Sources Successfully',
        data: expanses,
      });
    } catch (error) {
      next(error);
    }
  }

  static async expectedIncome(req, res, next) {
    try {
      const expectedIncome = await prisma.incomeResources.aggregate({
        _sum: {
          amount: true,
        },
      });

      res.status(200).json({
        status: true,
        message: 'Get Expected Income Successfully',
        data: {
          accountId: res.account.id,
          expectedIncome: expectedIncome._sum.amount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async earned(req, res, next) {
    try {
      const updatedTotalIncome = await prisma.$transaction(
        async function (prisma) {
          const itemIncome = await prisma.incomeResources.findFirstOrThrow({
            where: {
              id: req.params.source_income_id,
            },
          });

          const currentIncome = await prisma.profiles.findFirstOrThrow({
            where: {
              accountId: res.account.id,
            },
            select: {
              totalIncome: true,
              totalBalance: true,
            },
          });

          return await prisma.profiles.update({
            where: {
              accountId: res.account.id,
            },
            data: {
              totalBalance: currentIncome.totalBalance + itemIncome.amount,
              totalIncome: currentIncome.totalIncome + itemIncome.amount,
            },
          });
        }
      );

      res.status(200).json({
        status: true,
        message: 'Update Total Income Successfully',
        data: updatedTotalIncome,
      });
    } catch (error) {
      next(error);
    }
  }
  static async deleteIncome(req, res, next) {
    try {
      await prisma.incomeResources.delete({
        where: {
          id: req.params.id,
          account_id: res.account.id,
        },
      });

      res.status(200).json({
        status: true,
        message: 'Delete Income Successfully',
        data: [],
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateIncome(req, res, next) {
    try {
      const findIncome = await prisma.incomeResources.findFirst({
        where: {
          id: req.params.id,
          account_id: res.account.id,
        },
      });

      if (!findIncome) {
        throw new NotFoundError('Income Data Not Found');
      }

      const updateIncome = await prisma.incomeResources.update({
        where: {
          id: req.params.id,
          account_id: res.account.id,
        },
        data: {
          name: req.body.name,
          amount: req.body.amount,
          date: new Date(req.body.date),
          frequency: req.body.frequency,
          isRecurring: req.body.isRecurring,
          updatedAt: new Date(),
        },
      });

      res.status(200).json({
        status: true,
        message: 'Update Income Successfully',
        data: updateIncome,
      });
    } catch (error) {
      next(error);
    }
  }
}
