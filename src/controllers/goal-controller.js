import { prisma } from '../config/db.js';

export default class GoalController {
  static async create(req, res, next) {
    const body = req.body;
    try {
      const findGoal = await prisma.goals.findFirst({
        where: {
          name: body.name,
        },
      });

      if (findGoal != null) {
        throw new BadRequestError(`Goal name ${body.name} already exists`);
      }

      const createGoal = await prisma.goals.create({
        data: {
          name: body.name,
          description: body.description,
          accountId: res.account.id,
        },
      });

      res.status(201).json({
        status: true,
        message: 'add goals Successfully',
        data: createGoal,
      });
    } catch (error) {
      next(error);
    }
  }
  static async update(req, res, next) {
    const body = req.body;
    try {
      const findGoal = await prisma.goals.findFirst({
        where: {
          id: body.id,
        },
      });

      if (!findGoal) {
        throw new BadRequestError(`Goal Not exists`);
      }

      const updateGoal = await prisma.goals.update({
        where: { id: req.params.id },
        data: {
          name: body.name,
          description: body.description,
          accountId: res.account.id,
        },
      });

      res.status(201).json({
        status: true,
        message: 'add goals Successfully',
        data: updateGoal,
      });
    } catch (error) {
      next(error);
    }
  }
  static async get(req, res, next) {
    try {
      const findGoal = await prisma.goals.findMany({
        where: {
          accountId: res.account.id,
        },
      });

      if (!findGoal) {
        throw new NotFoundError(`Goal name ${findGoal.name} Not Found`);
      }

      res.status(200).json({
        status: true,
        message: 'Get Data Successfully',
        data: findGoal,
      });
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      const findGoal = await prisma.goals.findUnique({
        where: {
          id: req.params.id,
        },
      });

      if (!findGoal) {
        throw new NotFoundError(`Goal name ${findGoal.name} Not Found`);
      }
      await prisma.goals.delete({
        where: {
          id: req.params.id,
        },
      });

      res.status(200).json({
        status: true,
        message: 'Delete Goal Data Successfully',
        data: [],
      });
    } catch (error) {
      next(error);
    }
  }
}
