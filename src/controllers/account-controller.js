import { prisma } from '../config/db.js';
import bcrypt from 'bcrypt';
import { BadRequestError, NotFoundError } from '../errors/errors.js';
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
      });

      res.status(201).json({
        status: true,
        message: 'Get Data Profile Successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}
