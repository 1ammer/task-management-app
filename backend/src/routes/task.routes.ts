import express, { Router } from 'express';
import { getAllTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticate } from '../middlewares/auth';

const router: Router = express.Router();


router.use(authenticate);

router.route('/')
  .get(getAllTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

export default router;
