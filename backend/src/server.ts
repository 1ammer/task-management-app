import express, { type Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app: Application = express();
const PORT = process.env.PORT ?? 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req:Request, res:Response)=>{

  console.log("test husky");

    res.status(200).json({message:"OK"})

})



app.listen(PORT, (): void => {
  console.info(`Server is running on port ${PORT}`);
});