import { User } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('user');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findWithTasks(id: string): Promise<User | null> {
    return this.model.findUnique({
      where: { id },
      include: { tasks: true },
    });
  }
}
