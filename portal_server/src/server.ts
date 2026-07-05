import dotenv from "dotenv";
import app from "./app.js"; // Note the explicit extension, required by NodeNext

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

// Clean shutdown on system signals
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
