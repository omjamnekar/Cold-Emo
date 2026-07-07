import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} from "./projects.controller.js";

const router = Router();

/**
 * Project Management Routes
 * All routes require authentication
 */

router.post("/", authenticate, createProject);
router.get("/", authenticate, listProjects);
router.get("/:id", authenticate, getProject);
router.patch("/:id", authenticate, updateProject);
router.delete("/:id", authenticate, deleteProject);

export default router;
