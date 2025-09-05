import { z } from 'zod';


const taskIdSchema = z.uuid('Invalid task ID format');
const titleSchema = z
  .string({ message: 'Title is required' })
  .min(1, 'Title cannot be empty')
  .max(100, 'Title must be less than 100 characters');
const descriptionSchema = z
  .string()
  .max(500, 'Description must be less than 500 characters');


const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const categoryEnum = z.enum(['WORK', 'PERSONAL', 'STUDY', 'HEALTH', 'OTHER']);


const baseTaskBodySchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  category: categoryEnum,
  status: taskStatusEnum.optional().default('TODO'),
  priority: priorityEnum.optional().default('MEDIUM'),
});


export const createTaskSchema = z.object({
  body: baseTaskBodySchema,
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: taskIdSchema,
  }),
  body: baseTaskBodySchema
    .partial()
    .extend({ completed: z.boolean().optional() }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: taskIdSchema,
  }),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: taskIdSchema,
  }),
});

export const getAllTasksSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: categoryEnum.optional(),
    sortBy: z.enum(['createdAt', 'title']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTaskInput = z.infer<typeof getTaskSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type GetAllTasksInput = z.infer<typeof getAllTasksSchema>;
