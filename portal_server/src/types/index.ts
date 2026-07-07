/* ============================================
   DOMAIN TYPES - Core business entities
   ============================================ */

export type UUID = string & { readonly _brand: "UUID" };
export type Email = string & { readonly _brand: "Email" };

export interface User {
  id: UUID;
  email: Email;
  passwordHash: string;
  name: string;
  resumeUrl?: string;
  profileData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export interface Project {
  id: UUID;
  userId: UUID;
  companyName: string;
  notes?: string;
  status: ProjectStatus;
  employeeCount: number;
  searchProgress: number;
  createdAt: Date;
  updatedAt: Date;
  lastSearchedAt?: Date;
}

export enum EmployeeContactStatus {
  NEW = "NEW",
  EMAIL_GENERATED = "EMAIL_GENERATED",
  CONTACTED = "CONTACTED",
  ARCHIVED = "ARCHIVED",
}

export interface Employee {
  id: UUID;
  projectId: UUID;
  fullName: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  publicProfileUrls: string[];
  publicEmail?: Email;
  sourceInfo: {
    provider: string;
    discoveredAt: Date;
    confidence: number;
  };
  contactStatus: EmployeeContactStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedEmail {
  id: UUID;
  employeeId: UUID;
  userId: UUID;
  version: number;
  subject: string;
  body: string;
  status: "DRAFT" | "SENT" | "FAILED";
  sentAt?: Date;
  deliveryMetadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum JobStatus {
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface Job {
  id: UUID;
  userId: UUID;
  type: "SEARCH" | "EMAIL_GENERATION" | "BULK_EMAIL" | "EXPORT" | "ANALYSIS";
  status: JobStatus;
  progress: number;
  currentStep: string;
  currentMessage: string;
  data: Record<string, any>;
  errors: string[];
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/* ============================================
   REQUEST/RESPONSE TYPES
   ============================================ */

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, "passwordHash">;
}

export interface CreateProjectDto {
  companyName: string;
  notes?: string;
}

export interface UpdateProjectDto {
  companyName?: string;
  notes?: string;
  status?: ProjectStatus;
}

export interface ListEmployeesQuery {
  projectId: UUID;
  status?: EmployeeContactStatus;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "name";
  sortOrder?: "ASC" | "DESC";
}

export interface CreateEmailDto {
  employeeId: UUID;
  customInstructions?: string;
}

export interface SendEmailDto {
  generatedEmailId: UUID;
  recipientEmail: Email;
}

export interface InitiateSearchDto {
  projectId: UUID;
  companyName: string;
  customProviders?: string[];
}

/* ============================================
   EXPRESS REQUEST EXTENSIONS
   ============================================ */

export interface AuthenticatedRequest extends Express.Request {
  user: {
    id: UUID;
    email: Email;
  };
  token: string;
}

export interface OwnershipRequest extends AuthenticatedRequest {
  owner: User;
}

/* ============================================
   ERROR TYPES
   ============================================ */

export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path: string;
}

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/* ============================================
   SERVICE INTERFACES (Dependency Injection)
   ============================================ */

export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: UUID): Promise<T | null>;
  findOne(criteria: Partial<T>): Promise<T | null>;
  findMany(
    criteria: Partial<T>,
    options?: PaginationOptions,
  ): Promise<{ data: T[]; total: number }>;
  update(id: UUID, data: Partial<T>): Promise<T>;
  delete(id: UUID): Promise<boolean>;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface IEventEmitter {
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
  emit(event: string, data: any): void;
  once(event: string, handler: (data: any) => void): void;
}

export interface IJobQueue {
  enqueue(
    jobId: UUID,
    type: Job["type"],
    data: Record<string, any>,
  ): Promise<void>;
  dequeue(): Promise<Job | null>;
  updateProgress(
    jobId: UUID,
    progress: number,
    step: string,
    message: string,
  ): Promise<void>;
  markCompleted(jobId: UUID): Promise<void>;
  markFailed(jobId: UUID, error: string): Promise<void>;
}

export interface IValidator {
  validate(
    data: any,
    schema: any,
  ): Promise<{ valid: boolean; errors: string[] }>;
}

export interface ILogger {
  info(message: string, meta?: Record<string, any>): void;
  error(message: string, error?: Error, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
}
