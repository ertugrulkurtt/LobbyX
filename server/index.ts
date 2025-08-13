import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleFriends } from "./routes/friends";
import {
  uploadToR2,
  deleteFromR2,
  getR2UploadUrl,
  getR2FileMetadata,
  checkR2Health
} from "./routes/cloudflare-r2";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/friends", handleFriends);

  // Cloudflare R2 Storage Routes
  app.post("/api/upload-to-r2", uploadToR2);
  app.delete("/api/delete-from-r2", deleteFromR2);
  app.post("/api/get-r2-upload-url", getR2UploadUrl);
  app.get("/api/r2-file/:filePath(*)", getR2FileMetadata);
  app.get("/api/r2-health", checkR2Health);

  return app;
}
