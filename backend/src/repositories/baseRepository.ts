import prisma from '../utils/prismaClient';

export class BaseRepository<T> {
  protected model: any;

  constructor(modelName: string) {
    this.model = prisma[modelName as keyof typeof prisma];
    if (!this.model) {
      throw new Error(`Model ${modelName} not found in Prisma client`);
    }
  }

  async findAll(options: any = {}): Promise<T[]> {
    return this.model.findMany(options);
  }

  async findById(id: string, options: any = {}): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  async findOne(where: any, options: any = {}): Promise<T | null> {
    return this.model.findFirst({
      where,
      ...options,
    });
  }

  async create(data: any): Promise<T> {
    return this.model.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async count(where: any = {}): Promise<number> {
    return this.model.count({
      where,
    });
  }
}
