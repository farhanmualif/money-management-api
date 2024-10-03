import { prisma } from '../config/db.js';

export default class SubAccountController {
  static async create(req, res, next) {
    try {
      const { name, amount, created_date, account_type } = req.body;
      const createSubAccount = await prisma.subAccounts.create({
        data: {
          accountType: account_type,
          amount: amount,
          name: name,
          accountId: res.account.id,
        },
      });

      res.status(200).json({
        status: true,
        message: 'Create Sub account successful',
        data: createSubAccount,
      });
    } catch (error) {
      next(error);
    }
  }
}
