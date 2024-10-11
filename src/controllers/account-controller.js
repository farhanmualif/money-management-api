import { prisma } from '../config/db.js';
import bcrypt from 'bcrypt';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/errors.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export default class AccountController {
  static async signIn(req, res, next) {
    const { email, password } = req.body;
    try {
      const findAccount = await prisma.accounts.findUnique({
        where: {
          email: email,
        },
      });

      if (findAccount == null) {
        throw new NotFoundError('Account Not Found');
      }

      const passwordIsMatch = await bcrypt.compare(
        password,
        findAccount.password
      );

      if (!passwordIsMatch) {
        throw new NotFoundError('Email or Password is Wrong');
      }

      const token = jwt.sign({ email }, process.env.TOKEN_SECRET);

      const findToken = await prisma.token.findUnique({
        where: {
          token,
        },
      });

      if (findToken != null || findToken != undefined) {
        throw new BadRequestError('You Are Signed In');
      }

      const result = await prisma.token.create({
        data: {
          accountId: findAccount.id,
          token: token,
        },
      });

      res
        .status(200)
        .json({ status: true, message: 'Sign-in successful', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    const { email, phoneNumber, firstName, lastName } = req.body;
    try {
      const findAccount = await prisma.accounts.findUnique({
        where: {
          id: req.params.id,
        },
      });
      if (findAccount == null) {
        throw new NotFoundError('Account Not Found');
      }
      const updateProfile = await prisma.accounts.update({
        where: {
          id: req.params.id,
        },
        data: {
          email,
          phoneNumber,
          Profile: {
            update: {
              data: {
                firstName,
                lastName,
              },
            },
          },
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          Profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(200).json({
        status: true,
        message: 'Update Profile successful',
        data: {
          email: updateProfile.email,
          phoneNumber: updateProfile.phoneNumber,
          firstName: updateProfile.Profile.firstName,
          lastName: updateProfile.Profile.lastName,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async signUp(req, res, next) {
    try {
      const user = req.body;

      if (!user.email) {
        throw new BadRequestError('Email cannot be empty');
      }
      const existingAccount = await prisma.accounts.findUnique({
        where: { email: user.email },
      });

      if (existingAccount) {
        throw new BadRequestError('Email already exists');
      }
      user.password = await bcrypt.hash(user.password, 10);

      const createAccount = await prisma.accounts.create({
        data: {
          email: user.email,
          password: user.password,
          phoneNumber: user.phone_number,
          Profile: {
            create: {
              firstName: user.first_name ?? null,
              lastName: user.last_name ?? null,
              totalBalance: user.total_balance ?? null,
              totalIncome: user.total_income ?? 0,
              totalExpenses: user.total_expenses ?? 0,
            },
          },
        },
      });

      delete createAccount.password;

      res.status(201).json({
        status: true,
        message: 'Account created successfully',
        data: createAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const profile = await prisma.profiles.findFirst({
        where: {
          accountId: res.account.id,
        },
        include: {
          account: {},
        },
      });
      const account = profile.account;
      delete profile.account;
      delete account.password;

      res.status(201).json({
        status: true,
        message: 'Get Data Profile Successfully',
        data: {
          ...profile,
          ...account,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const authorizationHeader = req.headers['authorization'];
      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('You Are Not Authenticated');
      }

      const token = authorizationHeader.split(' ')[1];
      const findToken = await prisma.token.findUnique({
        where: {
          token,
        },
      });

      if (!findToken) {
        throw new NotFoundError('Token Not Found');
      }

      await prisma.token.delete({
        where: {
          token,
        },
      });

      res.status(200).json({
        status: true,
        message: 'Logout successful',
        data: [],
      });
    } catch (error) {
      next(error);
    }
  }

  static async authenticated(req, res, next) {
    try {
      const authorizationHeader = req.headers['authorization'];
      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('You Are Not Authenticated');
      }

      const token = authorizationHeader.split(' ')[1];
      const authenticated = await prisma.token.findFirst({
        where: {
          token,
          Accounts: {
            email: req.body.email,
          },
        },
        include: {
          Accounts: true,
        },
      });

      if (!authenticated) {
        throw new UnauthorizedError();
      }

      delete authenticated.Accounts.password;

      res.status(201).json({
        status: true,
        message: 'Authorization',
        data: authenticated,
      });
    } catch (error) {
      next(error);
    }
  }
  static async balanceHistory(req, res, next) {
    try {
      const balanceHistory = await prisma.balanceHistory.findMany({
        where: {
          accountId: res.account.id,
        },
      });

      res.status(201).json({
        status: true,
        message: 'Get Data Balance History successfully',
        data: balanceHistory,
      });
    } catch (error) {
      next(error);
    }
  }
}
