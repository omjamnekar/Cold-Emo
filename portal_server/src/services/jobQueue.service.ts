import { Job, JobStatus, UUID, IJobQueue } from "../types/index.js";
import { createLogger } from "../utils/logger.js";
import { eventEmitter } from "./eventEmitter.service.js";
import { EVENTS } from "../constants/index.js";

const logger = createLogger("JobQueue");

/**
 * In-memory job queue (use Bull/RabbitMQ in production)
 * Manages long-running async operations:
 * - Company searches
 * - Email generation
 * - Bulk operations
 * - Exports
 *
 * In production, replace with:
 * - Bull (Redis-backed)
 * - RabbitMQ
 * - AWS SQS
 */
export class JobQueue implements IJobQueue {
  private jobs: Map<UUID, Job> = new Map();
  private queue: UUID[] = [];

  async enqueue(
    jobId: UUID,
    type: Job["type"],
    data: Record<string, any>,
  ): Promise<void> {
    const job: Job = {
      id: jobId,
      userId: data.userId,
      type,
      status: JobStatus.QUEUED,
      progress: 0,
      currentStep: "QUEUED",
      currentMessage: "Job queued",
      data,
      errors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.queue.push(jobId);

    logger.info(`Job enqueued: ${type}`, { jobId });
    eventEmitter.emit(EVENTS.JOB_STARTED, { jobId, type });
  }

  async dequeue(): Promise<Job | null> {
    const jobId = this.queue.shift();
    if (!jobId) return null;

    const job = this.jobs.get(jobId);
    if (job) {
      job.status = JobStatus.RUNNING;
      job.startedAt = new Date();
      job.updatedAt = new Date();
    }

    return job || null;
  }

  async updateProgress(
    jobId: UUID,
    progress: number,
    step: string,
    message: string,
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.progress = Math.min(progress, 100);
    job.currentStep = step;
    job.currentMessage = message;
    job.updatedAt = new Date();

    logger.debug(`Job progress: ${jobId}`, { progress, step });
    eventEmitter.emit(EVENTS.JOB_PROGRESS, {
      jobId,
      progress: job.progress,
      step,
      message,
    });
  }

  async markCompleted(jobId: UUID): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = JobStatus.COMPLETED;
    job.progress = 100;
    job.completedAt = new Date();
    job.updatedAt = new Date();

    logger.info(`Job completed: ${jobId}`);
    eventEmitter.emit(EVENTS.JOB_COMPLETED, { jobId, type: job.type });
  }

  async markFailed(jobId: UUID, error: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = JobStatus.FAILED;
    job.errors.push(error);
    job.completedAt = new Date();
    job.updatedAt = new Date();

    logger.error(`Job failed: ${jobId}`, new Error(error));
    eventEmitter.emit(EVENTS.JOB_FAILED, { jobId, type: job.type, error });
  }

  getJob(jobId: UUID): Job | null {
    return this.jobs.get(jobId) || null;
  }

  getJobs(userId: UUID): Job[] {
    return Array.from(this.jobs.values()).filter(
      (job) => job.userId === userId,
    );
  }
}

// Singleton instance
export const jobQueue = new JobQueue();
