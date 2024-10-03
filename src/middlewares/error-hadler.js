import { Prisma } from '@prisma/client';
import {
  BaseError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from '../errors/errors.js';

import { ZodError } from 'zod';
import { parsePrismaError } from '../helpers/perse-prisma-error.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          status: false,
          errorCode: err.code,
          message: 'Terjadi konflik data yang unik',
        });
      case 'P2025':
        return res.status(404).json({
          status: false,
          errorCode: err.code,
          message: 'Data Not Found',
        });
      case 'P2023':
        return res.status(404).json({
          status: false,
          errorCode: err.code,
          message: 'Data Not Found',
        });
      default:
        const parsedError = parsePrismaError(err.message);
        return res.status(400).json({
          status: false,
          message: parsedError.readableError,
          errorCode: err.code,
          details: {
            prismaFunction: parsedError.prismaFunction,
            missingField: parsedError.missingField,
          },
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    const parsedError = parsePrismaError(err.message);
    return res.status(400).json({
      status: false,
      message: parsedError.readableError,
      details: {
        prismaFunction: parsedError.prismaFunction,
        missingField: parsedError.missingField,
      },
    });
  }

  if (err instanceof BadRequestError) {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((issue) => ({
      message: `${issue.path.join('.')} is ${issue.message}`,
    }));
    return res
      .status(400)
      .json({ status: false, message: 'Invalid data', details: errorMessages });
  } else {
    return res.status(400).json({ err: err.message });
  }
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: false,
    message: 'Endpoint not found',
  });
};
