import { Response, Request } from "express";
import {
  AuthenticatedRequest,
  UUID,
  CreateProjectDto,
  UpdateProjectDto,
  Project,
} from "../types/index.js";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";
import { container } from "../services/container.service.js";
import { createError } from "../utils/errors.js";
import { Validator, schemas } from "../utils/validator.js";
import { PAGINATION } from "../constants/index.js";

const projectRepo = container.getRepository<Project>("projects");
const eventEmitter = container.getEventEmitter();
const logger = container.getLogger("ProjectController");

/**
 * BEFORE (without architecture):
 * - Every endpoint validates input (repeat code)
 * - Every endpoint checks auth (repeat code)
 * - Every endpoint checks ownership (repeat code)
 * - Every endpoint logs events (repeat code)
 * - Error handling repeated everywhere
 *
 * AFTER (with architecture):
 * - Validation in utils/validator.ts
 * - Auth in middleware/auth.ts
 * - Ownership checks reused
 * - Events emitted from single place
 * - Error handler is global
 * Result: HALF THE CODE with SAME FUNCTIONALITY
 */

export const createProject = asyncHandler(async (req: any, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  // Validate input
  const dto = req.body as CreateProjectDto;
  Validator.throwIfInvalid(dto, {
    companyName: schemas.projectName,
  });

  // Create project (auto-associates with user)
  const project = await projectRepo.create({
    userId: authReq.user.id,
    companyName: dto.companyName,
    notes: dto.notes,
    status: "DRAFT" as any,
    employeeCount: 0,
    searchProgress: 0,
  } as any);

  logger.info("Project created", {
    userId: authReq.user.id,
    projectId: project.id,
  });
  eventEmitter.emit("project.created", { projectId: project.id });

  res.status(201).json(project);
});

export const listProjects = asyncHandler(async (req: any, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const {
    limit = PAGINATION.DEFAULT_LIMIT,
    offset = PAGINATION.DEFAULT_OFFSET,
  } = req.query;

  const { data, total } = await projectRepo.findMany(
    { userId: authReq.user.id } as any,
    {
      limit: Math.min(Number(limit), PAGINATION.MAX_LIMIT),
      offset: Number(offset),
      sortBy: "createdAt",
      sortOrder: "DESC",
    },
  );

  res.json({
    data,
    pagination: { total, limit, offset },
  });
});

export const getProject = asyncHandler(async (req: any, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = req.params;

  const project = await projectRepo.findById(id as UUID);
  if (!project) {
    throw createError.notFound("Project");
  }

  // Verify ownership
  if ((project as any).userId !== authReq.user.id) {
    throw createError.forbidden("Cannot access this project");
  }

  res.json(project);
});

export const updateProject = asyncHandler(async (req: any, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = req.params;
  const dto = req.body as UpdateProjectDto;

  // Validate input
  Validator.throwIfInvalid(dto, {
    companyName: { ...schemas.projectName, required: false },
    status: { type: "string", required: false },
  });

  const project = await projectRepo.findById(id as UUID);
  if (!project) {
    throw createError.notFound("Project");
  }

  // Verify ownership
  if ((project as any).userId !== authReq.user.id) {
    throw createError.forbidden("Cannot update this project");
  }

  const updated = await projectRepo.update(id as UUID, dto as any);

  logger.info("Project updated", { projectId: id });
  eventEmitter.emit("project.updated", { projectId: id });

  res.json(updated);
});

export const deleteProject = asyncHandler(async (req: any, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { id } = req.params;

  const project = await projectRepo.findById(id as UUID);
  if (!project) {
    throw createError.notFound("Project");
  }

  // Verify ownership
  if ((project as any).userId !== authReq.user.id) {
    throw createError.forbidden("Cannot delete this project");
  }

  // TODO: Delete cascading relationships
  // const employeeRepo = container.getRepository('employees');
  // await projectRepo.deleteWithRelations(id as UUID, [employeeRepo]);

  await projectRepo.delete(id as UUID);

  logger.info("Project deleted", { projectId: id });
  eventEmitter.emit("project.deleted", { projectId: id });

  res.status(204).send();
});
