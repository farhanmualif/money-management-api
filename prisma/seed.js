import { prisma } from '../src/config/db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

async function main() {
  // Create accounts
  const account1 = await prisma.accounts.create({
    data: {
      email: 'user@mail.com',
      phoneNumber: '087775785587',
      password: await bcrypt.hash('password123', 10),
      Profile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          totalBalance: 1000.0,
          totalIncome: 500.0,
          totalExpenses: 200.0,
          description: 'This is a test profile',
        },
      },
      Token: {
        create: {
          token: jwt.sign({ email: 'user@mail.com' }, process.env.TOKEN_SECRET),
        },
      },
      SubAccount: {
        create: {
          name: 'Savings',
          accountType: 'SAVINGS',
          amount: 500.0,
        },
      },
      Transaction: {
        create: {
          type: 'DEPOSIT',
          date: new Date('2022-01-01'),
          amount: 100.0,
        },
      },
      Goal: {
        create: {
          name: 'Buy a house',
          description: 'This is a test goal',
        },
      },
      Expenses: {
        create: {
          name: 'Rent',
          date: new Date('2022-01-01'),
          amount: 500.0,
          paymentMethod: 'BANK_TRANSFER',
          isRequring: false,
          frequency: 'Daily',
        },
      },
      IncomeResources: {
        create: {
          name: 'Salary',
          amount: 2000.0,
          isRecurring: true,
          frequency: 'MONTHLY',
          date: new Date('2022-01-01'),
        },
      },
      BalanceHistory: {
        create: [
          {
            balance: 20000,
          },
          {
            balance: 15000,
          },
          {
            balance: 10000,
          },
          {
            balance: 30000,
          },
          {
            balance: 20000,
          },
          {
            balance: 40000,
          },
        ],
      },
    },
  });

  const account2 = await prisma.accounts.create({
    data: {
      email: 'admin@mail.com',
      phoneNumber: '0858961462348',
      password: await bcrypt.hash('password123', 10),
      Profile: {
        create: {
          firstName: 'Jane',
          lastName: 'Doe',
          totalBalance: 2000.0,
          totalIncome: 1000.0,
          totalExpenses: 300.0,
          description: 'This is a test profile',
        },
      },
      Token: {
        create: {
          token: jwt.sign(
            { email: 'admin@mail.com' },
            process.env.TOKEN_SECRET
          ),
        },
      },
      SubAccount: {
        create: {
          name: 'Investments',
          accountType: 'INVESTMENTS',
          amount: 1000.0,
        },
      },
      Transaction: {
        create: {
          type: 'WITHDRAWAL',
          date: new Date('2022-01-15'),
          amount: 200.0,
        },
      },
      Goal: {
        create: {
          name: 'Buy a car',
          description: 'This is a test goal',
        },
      },
      Expenses: {
        createMany:{
          data: [
            {
              name: 'Utilities',
              date: new Date('2022-01-15'),
              amount: 100000,
              isEarned: true,
              paymentMethod: 'CREDIT_CARD',
              isRequring: true,
              frequency: 'Weekly',
            },
            {
              name: 'Internet',
              date: new Date('2022-01-15'),
              amount: 300000,
              isEarned: true,
              paymentMethod: 'TRANSFER',
              isRequring: true,
              frequency: 'Monthly',
            },
            {
              name: 'Bensin',
              date: new Date('2022-01-15'),
              amount: 100000,
              isEarned: true,
              paymentMethod: 'CREDIT_CARD',
              isRequring: true,
              frequency: 'Daily',
            }
          ]
        },
      },
      IncomeResources: {
        createMany: {
          data:[
            {
              name: 'Freelance',
              amount: 1500.0,
              isRecurring: false,
              frequency: 'Daily',
              isEarned: false,
              date: new Date('2022-01-15'),
            },
            {
              name: 'Work',
              amount: 1500.0,
              isRecurring: false,
              frequency: 'Monthly',
              isEarned: true,
              date: new Date('2022-01-15'),
            },
            {
              name: 'Joki',
              amount: 1500.0,
              isRecurring: true,
              frequency: 'Weekly',
              isEarned: false,
              date: new Date('2022-01-15'),
            },
          ]
        },
      },
      BalanceHistory: {
        create: [
          {
            balance: 20000,
          },
          {
            balance: 15000,
          },
          {
            balance: 10000,
          },
          {
            balance: 30000,
          },
          {
            balance: 20000,
          },
          {
            balance: 40000,
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
