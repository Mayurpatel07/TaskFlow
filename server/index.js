import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seed } from "./seed.js";
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  throw new Error("JWT_SECRET must contain at least 32 characters");
await connectDB();
if (process.env.SEED_DEMO === "true") await seed();
const server = app.listen(process.env.PORT || 4000, () =>
  console.log("TaskFlow API listening"),
);
process.on("SIGTERM", () => server.close(() => process.exit(0)));
