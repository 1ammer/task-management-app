import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import logger from '../utils/logger';
import ApiError from '../utils/apiError';

export const errorConverter = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message =
      error.message ||
      (httpStatus[statusCode as keyof typeof httpStatus] as string);
    const errorName =
      error.name ||
      (httpStatus[statusCode as keyof typeof httpStatus] as string);
    error = new ApiError(errorName, message, statusCode, false, err.stack);
  }
  next(error);
};

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let { error, message, statusCode } = err;

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    error = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    statusCode = 500;
  }

  res.locals.errorMessage = err.message;

  const response = {
    error: error,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
