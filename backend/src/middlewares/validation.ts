import { Request, Response, NextFunction } from 'express';
import { ZodType, z } from 'zod'; // Use 'z' for ZodError and ZodType

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body: any; query: any; params: any };
      
      req.body = result.body;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
        return;
      }

      next(error);
    }
  };
};