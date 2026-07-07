import { UUID, IRepository, PaginationOptions } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Repository");

/**
 * Generic repository pattern - eliminates repetitive CRUD code
 * Single implementation for Projects, Employees, Emails, etc.
 *
 * In production, use TypeORM/Prisma/Sequelize:
 * - Automatic migrations
 * - Query optimization
 * - Connection pooling
 * - Transaction support
 */
export class Repository<
  T extends { id: string | UUID; userId?: string | UUID },
> implements IRepository<T> {
  private storage: Map<string, T> = new Map();
  private indices: Map<string, Map<string, Set<string>>> = new Map();

  constructor(private entityName: string) {}

  async create(data: Partial<T>): Promise<T> {
    const id = this.generateId();
    const entity = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any as T;

    this.storage.set(id as string, entity);
    this.indexEntity(entity);

    logger.debug(`${this.entityName} created`, { id });
    return entity;
  }

  async findById(id: UUID | string): Promise<T | null> {
    return this.storage.get(id as string) || null;
  }

  async findOne(criteria: Partial<T>): Promise<T | null> {
    for (const entity of this.storage.values()) {
      if (this.matchesCriteria(entity, criteria)) {
        return entity;
      }
    }
    return null;
  }

  async findMany(
    criteria: Partial<T>,
    options?: PaginationOptions,
  ): Promise<{ data: T[]; total: number }> {
    let results = Array.from(this.storage.values()).filter((entity) =>
      this.matchesCriteria(entity, criteria),
    );

    const total = results.length;

    // Sorting
    if (options?.sortBy) {
      results.sort((a, b) => {
        const aVal = (a as any)[options.sortBy!];
        const bVal = (b as any)[options.sortBy!];

        if (options.sortOrder === "DESC") {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    // Pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || 20;
    const data = results.slice(offset, offset + limit);

    return { data, total };
  }

  async update(id: UUID | string, data: Partial<T>): Promise<T> {
    const entity = this.storage.get(id as string);
    if (!entity) {
      throw new Error(`${this.entityName} not found`);
    }

    const updated = { ...entity, ...data, updatedAt: new Date() };
    this.storage.set(id as string, updated);

    logger.debug(`${this.entityName} updated`, { id });
    return updated;
  }

  async delete(id: UUID | string): Promise<boolean> {
    const deleted = this.storage.delete(id as string);
    if (deleted) {
      logger.debug(`${this.entityName} deleted`, { id });
    }
    return deleted;
  }

  /**
   * Cascading delete - removes entity and all related records
   * Used for project deletion (removes employees, emails, etc.)
   */
  async deleteWithRelations(
    id: UUID | string,
    relatedRepositories: Repository<any>[],
  ): Promise<boolean> {
    const entity = this.storage.get(id as string);
    if (!entity) return false;

    this.storage.delete(id as string);

    // Delete related records (e.g., delete project → deletes all employees)
    for (const repo of relatedRepositories) {
      const related = await repo.findMany({ id } as any);
      for (const item of related.data) {
        await repo.delete(item.id);
      }
    }

    logger.info(`${this.entityName} and relations deleted`, { id });
    return true;
  }

  private matchesCriteria(entity: T, criteria: Partial<T>): boolean {
    return Object.entries(criteria).every(([key, value]) => {
      return (entity as any)[key] === value;
    });
  }

  private indexEntity(entity: T): void {
    // Simple indexing for userId to speed up queries
    if ((entity as any).userId) {
      const index = this.getOrCreateIndex("userId");
      const userId = (entity as any).userId as string;
      if (!index.has(userId)) {
        index.set(userId, new Set());
      }
      index.get(userId)!.add((entity as any).id as string);
    }
  }

  private getOrCreateIndex(key: string): Map<string, Set<string>> {
    if (!this.indices.has(key)) {
      this.indices.set(key, new Map());
    }
    return this.indices.get(key)!;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.storage.clear();
    this.indices.clear();
  }
}

/**
 * Factory to create typed repositories
 */
export const createRepository = <
  T extends { id: string | UUID; userId?: string | UUID },
>(
  entityName: string,
): Repository<T> => new Repository<T>(entityName);
