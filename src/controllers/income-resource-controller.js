import { prisma } from '../config/db.js';
import { NotFoundError, UnprocessableEntityError } from '../errors/errors.js';
import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from 'date-fns';

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
      // Agregasi sum dari amount di tabel incomeResources berdasarkan account_id
      const incomeResources = await prisma.incomeResources.aggregate({
        where: {
          account_id: res.account.id,
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
          expectedIncome: incomeResources._sum.amount ?? 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async earned(req, res, next) {
    try {
      const updatedTotalIncome = await prisma.$transaction(async (prisma) => {
        // Validate input
        const sourceIncomeId = req.params.source_income_id;
        if (!sourceIncomeId) {
          throw new BadRequestError('Invalid source income ID');
        }

        // Find income resource
        const incomeResource = await prisma.incomeResources.findFirst({
          where: { id: sourceIncomeId },
        });

        if (!incomeResource) {
          throw new NotFoundError('Income resource not found');
        }

        const currentTime = new Date();
        const lastEarnedDate = new Date(incomeResource.date);

        // Check frequency and compare dateso
        const frequency = incomeResource.frequency.toLowerCase();
        let canEarn = false;
        let waitTime;

        switch (frequency) {
          case 'daily':
            const daysDiff = differenceInDays(currentTime, lastEarnedDate);
            canEarn = daysDiff >= 1;
            waitTime = canEarn ? 0 : 1 - daysDiff;
            break;
          case 'weekly':
            const weeksDiff = differenceInWeeks(currentTime, lastEarnedDate);
            canEarn = weeksDiff >= 1;
            waitTime = canEarn
              ? 0
              : 7 - (differenceInDays(currentTime, lastEarnedDate) % 7);
            break;
          case 'monthly':
            const monthsDiff = differenceInMonths(currentTime, lastEarnedDate);
            canEarn = monthsDiff >= 1;
            // For simplicity, we'll assume a month is 30 days here
            waitTime = canEarn
              ? 0
              : 30 - (differenceInDays(currentTime, lastEarnedDate) % 30);
            break;
          default:
            throw new UnprocessableEntityError('Invalid frequency');
        }

        if (!canEarn) {
          throw new UnprocessableEntityError(
            `You need to wait ${waitTime} more day(s) before earning again.`
          );
        }

        // Get current profile
        const currentProfile = await prisma.profiles.findFirst({
          where: { accountId: res.account.id },
          select: { totalIncome: true, totalBalance: true },
        });

        if (!currentProfile) {
          throw new NotFoundError('Profile not found');
        }

        // Update profile
        const updatedProfile = await prisma.profiles.update({
          where: { accountId: res.account.id },
          data: {
            totalBalance: {
              increment: incomeResource.amount,
            },
            totalIncome: {
              increment: incomeResource.amount,
            },
          },
        });

        // Create balance history
        await prisma.balanceHistory.create({
          data: {
            accountId: res.account.id,
            balance: updatedProfile.totalBalance,
          },
        });

        // Update last earned date
        // if (itemIncome.isRecurring == true) {
        //   await prisma.incomeResources.update({
        //     where: { id: sourceIncomeId },
        //     data: { date: currentTime, isEarned: true },
        //   });
        // }

        await prisma.incomeResources.update({
          where: { id: sourceIncomeId },
          data: { date: currentTime, isEarned: true },
        });

        return updatedProfile;
      });

      res.status(200).json({
        status: true,
        message: 'Earned Income Successfully',
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
