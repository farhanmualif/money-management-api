import express from 'express';
import AccountController from '../controllers/account-controller.js';
import { validate, validateWithToken } from '../validations/validate.js';
import {
  userSignInSchema,
  userSignUpSchema,
} from '../validations/user-validation.js';
import { createSubaccountSchema } from '../validations/subaccount-validation.js';
import SubAccountController from '../controllers/subaccount-controller.js';
import IncomeRecourceController from '../controllers/income-resource-controller.js';
import { createIncomeResourceSchema } from '../validations/income-resource-validation.js';
import GoalController from '../controllers/goal-controller.js';
import { createGoalSchema } from '../validations/goal-validation.js';
import { ExpenceController } from '../controllers/expence-controller.js';
import { createExpenseSchema } from '../validations/expense-validation.js';
import { authenticated } from '../middlewares/authenticated.js';
import TransactionController from '../controllers/transaction-controller.js';
const router = express.Router();

router.post(
  '/account/signin',
  validate(userSignInSchema),
  AccountController.signIn
);

router.post('/account/logout', authenticated, AccountController.logout);

router.post(
  '/account/authenticated',
  authenticated,
  AccountController.authenticated
);

router.post(
  '/account/signup',
  validate(userSignUpSchema),
  AccountController.signUp
);

router.post(
  '/subaccount',
  validateWithToken(createSubaccountSchema),
  SubAccountController.create
);

router.get('/profile', authenticated, AccountController.getProfile);
router.get('/transaction', authenticated, TransactionController.get);
router.get('/transaction/:id', authenticated, TransactionController.getById);

router.post(
  '/income',
  validateWithToken(createIncomeResourceSchema),
  IncomeRecourceController.create
);

router.post(
  '/income/:source_income_id/earned',
  authenticated,
  IncomeRecourceController.earned
);

router.get('/income', authenticated, IncomeRecourceController.get);
router.get(
  '/expected-income',
  authenticated,
  IncomeRecourceController.expectedIncome
);

router.get('/income/:id', authenticated, IncomeRecourceController.getById);

router.put(
  '/income/:id',
  validateWithToken(createIncomeResourceSchema),
  IncomeRecourceController.updateIncome
);
router.delete(
  '/income/:id',
  authenticated,
  IncomeRecourceController.deleteIncome
);

router.post(
  '/goal',
  validateWithToken(createGoalSchema),
  GoalController.create
);
router.get('/goal', authenticated, GoalController.get);

router.post(
  '/expence',
  validateWithToken(createExpenseSchema),
  ExpenceController.create
);
router.get('/expence-upcoming', authenticated, ExpenceController.upcoming);
router.get('/balance-history', authenticated, AccountController.balanceHistory);

router.post(
  '/expence/:source_expense_id/earned',
  authenticated,
  ExpenceController.earned
);

router.get('/expence', authenticated, ExpenceController.get);
router.get('/expence/:id', authenticated, ExpenceController.getById);

export default router;
