import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { asyncRoute } from "../utils.js";
import * as a from "../controllers/authController.js";
import * as t from "../controllers/taskController.js";
const r = Router();
r.post("/register", asyncRoute(a.register));
r.post("/login", asyncRoute(a.login));
r.get("/me", auth, asyncRoute(a.me));
r.get("/users", auth, asyncRoute(t.users));
r.route("/tasks")
  .get(auth, asyncRoute(t.list))
  .post(auth, asyncRoute(t.create));
r.route("/tasks/:id")
  .get(auth, asyncRoute(t.get))
  .put(auth, asyncRoute(t.update))
  .delete(auth, asyncRoute(t.remove));
export default r;
