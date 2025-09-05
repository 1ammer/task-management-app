class ApiError extends Error {
  error: string;

  isOperational: boolean;
  statusCode:number

  constructor(error: string, message: string, statusCode=500, isOperational = true, stack = '') {
    super(message);
    this.error = error;
    this.statusCode = statusCode
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;