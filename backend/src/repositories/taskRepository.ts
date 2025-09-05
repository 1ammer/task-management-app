import { Task, TaskStatus, Priority } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super('task');
  }

  async findByUserId(userId: string): Promise<Task[]> {
    return this.findAll({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.findAll({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPriority(priority: Priority): Promise<Task[]> {
    return this.findAll({
      where: { priority },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserIdAndStatus(userId: string, status: TaskStatus): Promise<Task[]> {
    return this.findAll({
      where: { userId, status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserIdAndPriority(userId: string, priority: Priority): Promise<Task[]> {
    return this.findAll({
      where: { userId, priority },
      orderBy: { createdAt: 'desc' },
    });
  }
}
