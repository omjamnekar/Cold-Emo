# Quick Start Guide

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API keys and database URL
# Minimal required:
# - JWT_SECRET (any string, will be changed in production)
# - OPENAI_API_KEY (for email generation)
# - SENDGRID_API_KEY (for sending emails)
# - DATABASE_URL (PostgreSQL connection)
# - REDIS_URL (for job queue)

# Start development server (auto-reload)
npm run dev

# In another terminal, compile TypeScript
npm run build

# Run production
npm start
```

## Testing the API

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'

# Response: { "token": "...", "user": {...} }
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'

# Copy the returned token
```

### 3. Get Current User

```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create Project

```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "companyName": "Acme Corporation",
    "notes": "Target company for outreach campaign"
  }'

# Response: { "id": "...", "userId": "...", "companyName": "...", ...}
```

### 5. List Projects

```bash
curl -X GET "http://localhost:5000/api/v1/projects?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Get Single Project

```bash
curl -X GET http://localhost:5000/api/v1/projects/{PROJECT_ID} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Update Project

```bash
curl -X PATCH http://localhost:5000/api/v1/projects/{PROJECT_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "ACTIVE"
  }'
```

### 8. Delete Project

```bash
curl -X DELETE http://localhost:5000/api/v1/projects/{PROJECT_ID} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Adding a New Module (e.g., Employees)

### 1. Create Controller

```typescript
// src/routes/employees.controller.ts
import { asyncHandler } from "../middleware/errorHandler.js";
import { container } from "../services/container.js";
import { Employee, UUID } from "../types/index.js";

const employeeRepo = container.getRepository<Employee>("employees");
const logger = container.getLogger("EmployeeController");

export const listEmployees = asyncHandler(async (req: any, res) => {
  const { projectId } = req.params;

  // Ownership check on project first
  const projectRepo = container.getRepository("projects");
  const project = await projectRepo.findById(projectId as UUID);
  if (!project || (project as any).userId !== req.user.id) {
    throw createError.forbidden();
  }

  const { data, total } = await employeeRepo.findMany(
    { projectId: projectId as UUID } as any,
    { limit: 20, offset: 0 },
  );

  res.json({ data, total });
});
```

### 2. Create Routes

```typescript
// src/routes/employees.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { listEmployees } from "./employees.controller.js";

const router = Router({ mergeParams: true });

router.get("/:projectId/employees", authenticate, listEmployees);

export default router;
```

### 3. Register in App

```typescript
// src/app.ts
import employeeRoutes from "./routes/employees.js";

app.use(`${API_PREFIX}`, employeeRoutes); // New route
```

**That's it!** No auth checking, error handling, or logging to write—all handled by infrastructure.

## Architecture Components Usage

### Using the Container

```typescript
import { container } from "../services/container.js";

// Get repositories
const projectRepo = container.getRepository("projects");
const userRepo = container.getRepository<User>("users");

// Get logger
const logger = container.getLogger("MyService");

// Get job queue
const queue = container.getJobQueue();

// Get event emitter
const events = container.getEventEmitter();
```

### Using Events

```typescript
import { eventEmitter } from "../services/eventEmitter.js";
import { EVENTS } from "../constants/index.js";

// Emit an event
eventEmitter.emit(EVENTS.PROJECT_CREATED, { projectId: "123" });

// Listen for events
eventEmitter.on(EVENTS.PROJECT_CREATED, (data) => {
  logger.info("Project was created", data);
  sendNotification(data);
  updateAnalytics(data);
});
```

### Using Job Queue

```typescript
import { container } from "../services/container.js";

const queue = container.getJobQueue();

// Enqueue a job
const jobId = `search-${Date.now()}` as UUID;
await queue.enqueue(jobId, "SEARCH", {
  userId,
  projectId,
  companyName: "Acme Corp",
});

// Update progress (from worker)
await queue.updateProgress(
  jobId,
  25,
  "SEARCHING_SOURCES",
  "Searching LinkedIn...",
);

// Mark complete
await queue.markCompleted(jobId);

// Poll status (from frontend)
const job = queue.getJob(jobId);
// Returns: { status: "RUNNING", progress: 25, currentStep, currentMessage, ... }
```

### Using Validation

```typescript
import { Validator, schemas } from "../utils/validator.js";

// Validate with schema
const { valid, errors } = Validator.validate(req.body, {
  email: schemas.email,
  password: schemas.password,
  name: { type: "string", required: true, min: 1, max: 100 },
});

if (!valid) {
  throw createError.validation("Invalid input", { errors });
}

// Or throw immediately
Validator.throwIfInvalid(req.body, {
  projectId: schemas.uuid,
});
```

### Using Error Handling

```typescript
import { createError } from "../utils/errors.js";

// Throw typed errors
throw createError.notFound("Project");
throw createError.unauthorized("Invalid credentials");
throw createError.forbidden("Cannot access this resource");
throw createError.conflict("User already exists");
throw createError.validation("Email is invalid", { field: "email" });
throw createError.rateLimited(60); // Retry after 60 seconds
throw createError.internal("Database connection failed");
```

All errors are automatically:

- Caught by global error handler
- Converted to standard response format
- Logged (with stack trace in dev mode)
- Sent to client with appropriate HTTP status

## Environment Variables Explained

### Core Server

- `NODE_ENV`: development | production | test
- `PORT`: Server port (default: 5000)
- `HOST`: Server host (default: localhost)

### Security

- `JWT_SECRET`: Secret key for signing JWT tokens (change in production!)
- `JWT_EXPIRES_IN`: Token expiration (default: 7d)
- `BCRYPT_ROUNDS`: Password hashing rounds (default: 10)

### Database

- `DATABASE_URL`: PostgreSQL connection string
- `DATABASE_LOG`: Enable query logging (true/false)

### External Services

- `OPENAI_API_KEY`: API key for GPT models
- `SENDGRID_API_KEY`: API key for sending emails
- `REDIS_URL`: Redis connection for job queue

### Features

- `ENABLE_SWAGGER`: Enable API documentation
- `ENABLE_METRICS`: Enable Prometheus metrics

## Debugging

### Enable Debug Logging

```bash
# All debug logs
NODE_ENV=development npm run dev

# Logs will show all middleware, events, and database operations
```

### Monitor Events

```typescript
// Add to server.ts or a debug file
import { eventEmitter } from "./services/eventEmitter.js";
import { EVENTS } from "./constants/index.js";

// Log all events
Object.values(EVENTS).forEach((event) => {
  eventEmitter.on(event, (data) => {
    console.log(`[EVENT] ${event}`, data);
  });
});
```

## Common Patterns

### Ownership Validation

```typescript
const project = await projectRepo.findById(projectId as UUID);
if (!project || (project as any).userId !== req.user.id) {
  throw createError.forbidden("Cannot access this project");
}
```

### Cascading Delete

```typescript
// Delete project and all related employees
const employeeRepo = container.getRepository("employees");
await projectRepo.deleteWithRelations(projectId, [employeeRepo]);
```

### Async Event Processing

```typescript
// Emit event with automatic listener invocation
eventEmitter.emit(EVENTS.SEARCH_STARTED, { projectId, jobId });

// Listener processes (can be moved to worker later)
eventEmitter.on(EVENTS.SEARCH_STARTED, async (data) => {
  const job = await jobQueue.dequeue();
  // Start long-running operation
  // Update progress: await queue.updateProgress(...)
  // Complete: await queue.markCompleted(jobId)
});
```

---

## Next Steps

1. **Add Database Layer**: Migrate from in-memory to Prisma + PostgreSQL
2. **Implement Search Module**: Integrate search providers
3. **Implement Email Generation**: Connect to OpenAI
4. **Add WebSockets**: Real-time progress updates
5. **Deploy**: Docker container to production
6. **Monitor**: Add health checks, metrics, alerts

See `ARCHITECTURE.md` for detailed scalability roadmap.
