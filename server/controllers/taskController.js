import mongoose from "mongoose";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { parse, taskSchema } from "../utils.js";
const access = (req) =>
  req.user.role === "admin"
    ? {}
    : { $or: [{ createdBy: req.user.id }, { assignedUser: req.user.id }] };
const populated = (q) =>
  q.populate("assignedUser", "name email").populate("createdBy", "name");
const idCheck = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    const e = new Error("Task not found.");
    e.status = 404;
    throw e;
  }
};
export async function list(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1),
    limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 8));
  const filter = access(req);
  if (req.query.search)
    filter.title = {
      $regex: String(req.query.search)
        .slice(0, 120)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  for (const k of ["status", "priority"])
    if (req.query[k]) {
      const allowed =
        k === "status"
          ? ["pending", "in-progress", "completed"]
          : ["low", "medium", "high"];
      if (!allowed.includes(req.query[k]))
        return res.status(400).json({ message: `Invalid ${k} filter.` });
      filter[k] = req.query[k];
    }
  const sort =
    req.query.sort === "oldest"
      ? { dueDate: 1, _id: 1 }
      : req.query.sort === "newest"
        ? { createdAt: -1, _id: -1 }
        : { dueDate: 1, _id: 1 };
  const [tasks, total, all] = await Promise.all([
    populated(
      Task.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
    ),
    Task.countDocuments(filter),
    Task.find(access(req)).select("status dueDate priority"),
  ]);
  res.json({
    tasks,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    stats: {
      total: all.length,
      pending: all.filter((t) => t.status === "pending").length,
      "in-progress": all.filter((t) => t.status === "in-progress").length,
      completed: all.filter((t) => t.status === "completed").length,
    },
  });
}
export async function get(req, res) {
  idCheck(req.params.id);
  const task = await populated(
    Task.findOne({ _id: req.params.id, ...access(req) }),
  );
  if (!task) return res.status(404).json({ message: "Task not found." });
  res.json({ task });
}
export async function create(req, res) {
  const data = parse(taskSchema, req.body);
  if (!(await User.exists({ _id: data.assignedUser })))
    return res.status(400).json({ message: "Assigned user does not exist." });
  const t = await Task.create({ ...data, createdBy: req.user.id });
  res.status(201).json({ task: await populated(Task.findById(t.id)) });
}
export async function update(req, res) {
  idCheck(req.params.id);
  const task = await Task.findOne({ _id: req.params.id, ...access(req) });
  if (!task) return res.status(404).json({ message: "Task not found." });
  if (req.user.role !== "admin" && String(task.createdBy) !== req.user.id)
    return res
      .status(403)
      .json({
        message: "Only the task creator or an admin can edit this task.",
      });
  const data = parse(taskSchema, req.body);
  if (!(await User.exists({ _id: data.assignedUser })))
    return res.status(400).json({ message: "Assigned user does not exist." });
  Object.assign(task, data);
  await task.save();
  res.json({ task: await populated(Task.findById(task.id)) });
}
export async function remove(req, res) {
  idCheck(req.params.id);
  const t = await Task.findOne({ _id: req.params.id, ...access(req) });
  if (!t) return res.status(404).json({ message: "Task not found." });
  if (req.user.role !== "admin" && String(t.createdBy) !== req.user.id)
    return res
      .status(403)
      .json({
        message: "Only the task creator or an admin can delete this task.",
      });
  await t.deleteOne();
  res.json({ message: "Task deleted." });
}
export async function users(req, res) {
  res.json({
    users: await User.find()
      .select("name email role")
      .sort({ name: 1 })
      .limit(200),
  });
}
