import prisma from '../utils/prismaClient';
import { UserRepository, TaskRepository } from '../repositories';

// Singleton class to manage database services
export class DbService {
  private static instance: DbService;
  private _userRepository: UserRepository;
  private _taskRepository: TaskRepository;

  private constructor() {
    this._userRepository = new UserRepository();
    this._taskRepository = new TaskRepository();
  }

  public static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  // Get the Prisma client instance
  get prisma() {
    return prisma;
  }

  // Get repositories
  get users() {
    return this._userRepository;
  }

  get tasks() {
    return this._taskRepository;
  }

  // Transaction helper
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }
}
