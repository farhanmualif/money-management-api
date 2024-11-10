import { prisma } from '../config/db.js';
import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from 'date-fns';
import { NotFoundError, UnprocessableEntityError } from '../errors/errors.js';

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
          isRequring: body.isRequring,
          frequency: body.frequency,
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

  static async delete(req, res, next) {
    const { id } = req.params;
    const accountId = res.account.id;

    if (!id || !accountId) {
      return res.status(400).json({
        status: false,
        message: 'Invalid input parameters',
      });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const expense = await tx.expenses.findUnique({
          where: {
            id: id,
            accountId: accountId,
          },
          select: {
            amount: true,
          },
        });

        if (!expense) {
          throw new NotFoundError('Expense Not Found');
        }

        await tx.profiles.update({
          where: {
            accountId: accountId,
          },
          data: {
            totalExpenses: {
              decrement: expense.amount,
            },
          },
        });

        await tx.expenses.delete({
          where: {
            id,
            accountId,
          },
        });

        return { message: 'Expense deleted successfully' };
      });

      return res.status(200).json({
        status: true,
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    const body = req.body;
    try {
      const updated = await prisma.expenses.update({
        where: {
          id: req.params.id,
        },
        data: {
          name: body.name,
          amount: body.amount,
          date: new Date(body.date),
          paymentMethod: body.paymentMethod,
          isRequring: body.isRequring,
          frequency: body.frequency,
        },
      });
      res.status(200).json({
        status: true,
        message: 'Update Expenses Successfully',
        data: updated,
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
      // Set ke awal hari

      const upcomingExpenses = await prisma.expenses.findMany({
        where: {
          isEarned: false,
          accountId: res.account.id,
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Opsional: Tambahkan logika untuk mengelompokkan pengeluaran berdasarkan periode waktu
      // const groupedExpenses = {
      //   today: [],
      //   thisWeek: [],
      //   thisMonth: [],
      //   later: [],
      // };

      // const oneWeekLater = new Date(today);
      // oneWeekLater.setDate(today.getDate() + 7);

      // const oneMonthLater = new Date(today);
      // oneMonthLater.setMonth(today.getMonth() + 1);

      // upcomingExpenses.forEach((expense) => {
      //   if (expense.date.toDateString() === today.toDateString()) {
      //     groupedExpenses.today.push(expense);
      //   } else if (expense.date < oneWeekLater) {
      //     groupedExpenses.thisWeek.push(expense);
      //   } else if (expense.date < oneMonthLater) {
      //     groupedExpenses.thisMonth.push(expense);
      //   } else {
      //     groupedExpenses.later.push(expense);
      //   }
      // });

      res.status(200).json({
        status: true,
        message: 'Get Upcoming Expenses Successfully',
        data: upcomingExpenses,
      });
    } catch (error) {
      next(error);
    }
  }

  static async expectedExpense(req, res, next) {
    try {
      const expensesUpcoming = await prisma.expenses.aggregate({
        where: {
          accountId: res.account.id,
          isEarned: false,
        },
        _sum: {
          amount: true,
        },
      });

      res.status(200).json({
        status: true,
        message: 'Get Expected Income Successfully',
        data: {
          accountId: res.account.id,
          expectedExpence: expensesUpcoming._sum.amount ?? 0,
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
          // Get current profile data
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

          // Get expense data first to check amount
          const findExpense = await prisma.expenses.findFirst({
            where: {
              id: req.params.source_expense_id,
            },
            select: {
              amount: true,
            },
          });

          // Validate if balance is sufficient
          if (currentExpense.totalBalance < findExpense.amount) {
            throw new UnprocessableEntityError('Balance is not enough');
          }

          const itemExpense = await prisma.expenses.update({
            where: {
              id: req.params.source_expense_id,
            },
            data: {
              isEarned: true,
            },
            select: {
              amount: true,
              date: true,
              paymentMethod: true,
              isRequring: true,
              frequency: true,
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
