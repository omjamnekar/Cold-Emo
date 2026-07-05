import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app: Application = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health Check Route
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "Server is healthy" });
});

export default app;
