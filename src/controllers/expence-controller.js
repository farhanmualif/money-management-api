import { prisma } from '../config/db.js';

export class ExpenceController {
  static async create(req, res, next) {
    try {
      const body = req.body;
      const createExpanse = await prisma.expenses.create({
        data: {
          name: body.name,
          amount: body.amount,
          date: new Date(body.date),
          accountId: res.account.id,
          paymentMethod: body.payment_method,
        },
      });

      res.status(201).json({
        status: true,
        message: 'add expences Successfully',
        data: createExpanse,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req, res, next) {
    try {
      const expenses = await prisma.expenses.findMany({
        where: {
          accountId: res.account.id,
        },
      });
      res.status(200).json({
        status: true,
        message: 'Get Expenses Successfully',
        data: expenses,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const expense = await prisma.expenses.findFirst({
        where: {
          id: req.params.id,
          accountId: res.account.id,
        },
      });
      res.status(200).json({
        status: true,
        message: 'Get Expenses Successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  static async upcoming(req, res, next) {
    try {
      const expense = await prisma.expenses.findMany({
        where: {
          id: req.params.id,
          date: {
            gt: new Date(),
          },
        },
      });
      res.status(200).json({
        status: true,
        message: 'Get Expenses Successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  static async earned(req, res, next) {
    try {
      const updatedTotalIncome = await prisma.$transaction(
        async function (prisma) {
          const itemExpense = await prisma.expenses.findFirstOrThrow({
            where: {
              id: req.params.source_expense_id,
            },
            select: {
              amount: true,
              date: true,
              paymentMethod: true,
            },
          });

          const currentExpense = await prisma.profiles.findFirstOrThrow({
            where: {
              accountId: res.account.id,
            },
            select: {
              totalExpenses: true,
              totalBalance: true,
              totalIncome: true,
            },
          });

          await prisma.transaction.create({
            data: {
              amount: itemExpense.amount,
              date: itemExpense.date,
              type: itemExpense.paymentMethod,
              accountId: res.account.id,
            },
          });

          const updateProfile = await prisma.profiles.update({
            where: {
              accountId: res.account.id,
            },
            data: {
              totalBalance: currentExpense.totalBalance - itemExpense.amount,
              totalExpenses: currentExpense.totalExpenses + itemExpense.amount,
            },
          });

          await prisma.balanceHistory.create({
            data: {
              accountId: res.account.id,
              balance: updateProfile.totalBalance,
            },
          });

          return updateProfile;
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
}
