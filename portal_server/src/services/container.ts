import { Repository, createRepository } from "./repository.js";
import { JobQueue } from "./jobQueue.js";
import { EventEmitter, eventEmitter } from "./eventEmitter.js";
import { Logger, createLogger } from "../utils/logger.js";
import { Project, Employee, GeneratedEmail, User } from "../types/index.js";

/**
 * Dependency Injection Container
 * Singleton that provides all services throughout the app
 * Makes it easy to swap implementations (e.g., in-memory to database)
 *
 * Usage:
 * const container = Container.getInstance();
 * const projectRepo = container.getRepository('projects');
 * const jobQueue = container.getJobQueue();
 */
export class Container {
  private static instance: Container;

  private repositories: Map<string, Repository<any>> = new Map();
  private jobQueue: JobQueue;
  private eventEmitter: EventEmitter;
  private loggers: Map<string, Logger> = new Map();

  private constructor() {
    this.jobQueue = new JobQueue();
    this.eventEmitter = eventEmitter;

    // Initialize repositories
    this.repositories.set("users", createRepository<User>("User"));
    this.repositories.set("projects", createRepository<Project>("Project"));
    this.repositories.set("employees", createRepository<Employee>("Employee"));
    this.repositories.set(
      "emails",
      createRepository<GeneratedEmail>("GeneratedEmail"),
    );
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Get typed repository
   * Example: container.getRepository<Project>('projects')
   */
  getRepository<T extends { id: string; userId?: string }>(
    name: string,
  ): Repository<T> {
    const repo = this.repositories.get(name);
    if (!repo) {
      throw new Error(`Repository ${name} not found`);
    }
    return repo;
  }

  getJobQueue(): JobQueue {
    return this.jobQueue;
  }

  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  getLogger(name: string): Logger {
    if (!this.loggers.has(name)) {
      this.loggers.set(name, createLogger(name));
    }
    return this.loggers.get(name)!;
  }

  /**
   * Register custom repository (for testing or specialized types)
   */
  registerRepository<T extends { id: string; userId?: string }>(
    name: string,
    repo: Repository<T>,
  ): void {
    this.repositories.set(name, repo);
  }

  /**
   * Clear all state (for testing)
   */
  reset(): void {
    this.repositories.forEach((repo) => repo.clear());
  }
}

export const container = Container.getInstance();
