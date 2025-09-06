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
  dueDate: z.string()
    .optional()
    .refine((str) => {
      if (!str) return true;
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?Z?$/;
      const localRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      return isoRegex.test(str) || localRegex.test(str);
    }, 'Invalid date format. Use YYYY-MM-DDTHH:MM or full ISO datetime')
    .transform((str) => {
      if (!str) return undefined;
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
        return new Date(str + ':00').toISOString();
      }
      if (str.includes('Z') || str.includes('+')) {
        return new Date(str).toISOString();
      }
      return new Date(str).toISOString();
    }),
  progress: z.union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num)) throw new Error('Progress must be a valid number');
      return num;
    })
    .pipe(z.number().int().min(0).max(100))
    .optional()
    .default(0),
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
    sortBy: z.enum(['createdAt', 'title', 'dueDate']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  category: categoryEnum,
  status: taskStatusEnum,
  priority: priorityEnum,
  completed: z.boolean(),
  dueDate: z.date().nullable(),
  progress: z.number().int().min(0).max(100),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createTaskResponseSchema = z.object({
  status: z.literal('success'),
  message: z.string(),
  data: taskResponseSchema,
});

export const updateTaskResponseSchema = z.object({
  status: z.literal('success'),
  message: z.string(),
  data: taskResponseSchema,
});

export const getTaskResponseSchema = z.object({
  status: z.literal('success'),
  data: taskResponseSchema,
});

export const getAllTasksResponseSchema = z.object({
  status: z.literal('success'),
  data: z.array(taskResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }).optional(),
});

export const deleteTaskResponseSchema = z.object({
  status: z.literal('success'),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  status: z.literal('error'),
  message: z.string(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
});

// Input types
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTaskInput = z.infer<typeof getTaskSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type GetAllTasksInput = z.infer<typeof getAllTasksSchema>;

// Response types
export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type CreateTaskResponse = z.infer<typeof createTaskResponseSchema>;
export type UpdateTaskResponse = z.infer<typeof updateTaskResponseSchema>;
export type GetTaskResponse = z.infer<typeof getTaskResponseSchema>;
export type GetAllTasksResponse = z.infer<typeof getAllTasksResponseSchema>;
export type DeleteTaskResponse = z.infer<typeof deleteTaskResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
