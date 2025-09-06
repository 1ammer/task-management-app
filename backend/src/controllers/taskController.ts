import { Request, Response } from 'express';
import { DbService } from '../services';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/apiError';
import { Category } from '@prisma/client';
import socketService from '../services/socketService';

const db = DbService.getInstance();

export const getAllTasks = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError('Unauthorized', 'Unauthorized', 401);
  }

  const { search, sortBy, sortOrder, category } = req.query;

  const tasks = await db.tasks.findByUserIdWithSearchAndSort(
    userId,
    search as string,
    sortBy as 'createdAt' | 'title',
    sortOrder as 'asc' | 'desc',
    category as Category,
    );

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

export const getTask = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id!;

  if (!userId) {
    throw new ApiError('Unauthorized', 'Unauthorized', 401);
  }

  const task = await db.tasks.findById(taskId);

  if (!task) {
    throw new ApiError('Task not found', 'Task not found', 404);
  }

  if (task.userId !== userId) {
    throw new ApiError('Forbidden', 'Forbidden', 403);
  }

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError('Unauthorized', 'Unauthorized', 401);
  }

  const taskData = {
    ...req.body,
    userId,
  };

  const task = await db.tasks.create(taskData);

  // Emit real-time event
  socketService.emitTaskCreated(task);

  res.status(201).json({
    status: 'success',
    data: {
      task,
    },
  });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id!;

  if (!userId) {
    throw new ApiError('Unauthorized', 'Unauthorized', 401);
  }

  const task = await db.tasks.findById(taskId);

  if (!task) {
    throw new ApiError('Task not found', 'Task not found', 404);
  }

  if (task.userId !== userId) {
    throw new ApiError('Forbidden', 'Forbidden', 403);
  }

  const updatedTask = await db.tasks.update(taskId, req.body);

  // Emit real-time event
  socketService.emitTaskUpdated(updatedTask);

  res.status(200).json({
    status: 'success',
    data: {
      task: updatedTask,
    },
  });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const taskId = req.params.id!;

  if (!userId) {
    throw new ApiError('Unauthorized', 'Unauthorized', 401);
  }

  const task = await db.tasks.findById(taskId);

  if (!task) {
    throw new ApiError('Task not found', 'Task not found', 404);
  }

  if (task.userId !== userId) {
    throw new ApiError('Forbidden', 'Forbidden', 403);
  }

  await db.tasks.delete(taskId);

  // Emit real-time event
  socketService.emitTaskDeleted(taskId, userId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
