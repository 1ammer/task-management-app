import express, { Router } from 'express';
import { getAllTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { createTaskSchema, updateTaskSchema, getTaskSchema, deleteTaskSchema } from '../validations/task.validation';

const router: Router = express.Router();


router.use(authenticate);

router.route('/')
  .get(getAllTasks)
  .post(validate(createTaskSchema), createTask);

router.route('/:id')
  .get(validate(getTaskSchema), getTask)
  .patch(validate(updateTaskSchema), updateTask)
  .delete(validate(deleteTaskSchema), deleteTask);

export default router;
