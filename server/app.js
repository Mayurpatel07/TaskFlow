import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";
const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",")
      : ["http://localhost:5173"],
  }),
);
app.use(express.json({ limit: "32kb" }));
app.get("/health", (_q, r) =>
  r.json({ status: "ok", service: "taskflow-api" }),
);
app.use(
  ["/login", "/register"],
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many sign-in attempts. Try again in 15 minutes." },
  }),
);
app.use(routes);
app.use((_q, r) => r.status(404).json({ message: "Endpoint not found." }));
app.use((e, _q, r, _n) => {
  const status =
    e.status ||
    (e.code === 11000 || e.name === "ValidationError" || e.name === "CastError"
      ? 400
      : 500);
  if (status === 500) console.error(e.name, e.message);
  r.status(status).json({
    message:
      status === 500
        ? "Something went wrong. Please try again."
        : e.code === 11000
          ? "An account with this email already exists."
          : e.message,
  });
});
export default app;
