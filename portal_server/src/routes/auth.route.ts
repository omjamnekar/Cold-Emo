import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";
import { createError } from "../utils/errors.js";
import { Validator, schemas } from "../utils/validator.js";
import { generateToken, authenticate } from "../middleware/auth.middleware.js";
import { container } from "../services/container.service.js";
import { User, UUID } from "../types/index.js";

const router = Router();
const userRepo = container.getRepository<User>("users");
const logger = container.getLogger("AuthController");

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  // Validate
  Validator.throwIfInvalid(
    { email, password },
    {
      email: schemas.email,
      password: schemas.password,
    },
  );

  // Check if user exists
  const existing = await userRepo.findOne({ email: email as any } as any);
  if (existing) {
    throw createError.conflict("User already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await userRepo.create({
    email: email as any,
    passwordHash,
    name,
  });

  logger.info("User registered", { userId: user.id });

  const token = generateToken(user.id as UUID, user.email);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate
  Validator.throwIfInvalid(
    { email, password },
    {
      email: schemas.email,
      password: schemas.password,
    },
  );

  // Find user
  const user = await userRepo.findOne({ email: email as any } as any);
  if (!user) {
    throw createError.unauthorized("Invalid credentials");
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw createError.unauthorized("Invalid credentials");
  }

  logger.info("User logged in", { userId: user.id });

  const token = generateToken(user.id as UUID, user.email);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

export const me = asyncHandler(async (req: any, res: Response) => {
  const user = await userRepo.findById(req.user.id as UUID);
  if (!user) {
    throw createError.notFound("User");
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
});

// Routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);

export default router;
