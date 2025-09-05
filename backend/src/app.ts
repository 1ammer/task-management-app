import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import httpStatus from 'http-status';

import routes from './routes/index';
import { errorConverter, errorHandler } from './middlewares/error';
import logger from './utils/logger';

const app: Express = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());

app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }),
);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

const apiPrefix = process.env.API_PREFIX || '/api/v1';
app.use(apiPrefix, routes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(httpStatus.OK).send({ status: 'ok' });
});

app.use((_req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).send({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

app.use(errorConverter);

app.use(errorHandler);

export default app;
