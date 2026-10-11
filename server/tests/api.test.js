import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import app from "../app.js";
import User from "../models/User.js";
let db, token, userId, taskId;
process.env.JWT_SECRET = "test-secret-at-least-thirty-two-characters-long";
before(async () => {
  db = await MongoMemoryServer.create();
  await mongoose.connect(db.getUri());
  await User.init();
});
after(async () => {
  await mongoose.disconnect();
  await db.stop();
});
test("registration validates inputs and hashes the password", async () => {
  await request(app)
    .post("/register")
    .send({ name: "A", email: "bad", password: "x" })
    .expect(400);
  const r = await request(app)
    .post("/register")
    .send({
      name: "Test Person",
      email: "person@example.com",
      password: "Test@1234",
    })
    .expect(201);
  token = r.body.token;
  userId = r.body.user.id;
  assert.equal(r.body.user.role, "user");
  assert.equal(r.body.user.password, undefined);
  const u = await User.findById(userId).select("+password");
  assert.notEqual(u.password, "Test@1234");
  assert.ok(await bcrypt.compare("Test@1234", u.password));
});
test("duplicate registration and invalid login fail safely", async () => {
  await request(app)
    .post("/register")
    .send({
      name: "Test Person",
      email: "person@example.com",
      password: "Test@1234",
    })
    .expect(400);
  await request(app)
    .post("/login")
    .send({ email: "person@example.com", password: "wrong" })
    .expect(401);
  const r = await request(app)
    .post("/login")
    .send({
      email: "person@example.com",
      password: "Test@1234",
      rememberMe: true,
    })
    .expect(200);
  assert.ok(r.body.token);
});
test("protected endpoints reject missing or invalid JWT", async () => {
  await request(app).get("/tasks").expect(401);
  await request(app)
    .get("/tasks")
    .set("Authorization", "Bearer invalid")
    .expect(401);
});
test("creates a task with all required fields", async () => {
  const r = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Ship the app",
      description: "Verify deployment",
      priority: "high",
      status: "pending",
      dueDate: "2026-10-12",
      assignedUser: userId,
    })
    .expect(201);
  taskId = r.body.task._id;
  assert.equal(r.body.task.assignedUser.name, "Test Person");
});
test("task validation rejects invalid fields and nonexistent assignee", async () => {
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "", dueDate: "bad" })
    .expect(400);
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Task", dueDate: "2026-02-30", assignedUser: userId })
    .expect(400);
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Task",
      dueDate: "2026-10-12",
      assignedUser: "aaaaaaaaaaaaaaaaaaaaaaaa",
    })
    .expect(400);
});
test("retrieves, searches, filters and paginates tasks", async () => {
  const r = await request(app)
    .get("/tasks?search=ship&priority=high&status=pending&limit=1&page=1")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
  assert.equal(r.body.total, 1);
  assert.equal(r.body.stats.total, 1);
  await request(app)
    .get("/tasks?status=broken")
    .set("Authorization", `Bearer ${token}`)
    .expect(400);
  await request(app)
    .get(`/tasks/${taskId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
});
test("updates tasks", async () => {
  const r = await request(app)
    .put(`/tasks/${taskId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "App shipped",
      description: "All done",
      priority: "medium",
      status: "completed",
      dueDate: "2026-10-12",
      assignedUser: userId,
    })
    .expect(200);
  assert.equal(r.body.task.status, "completed");
});
test("isolates another member and prevents role escalation", async () => {
  const r = await request(app)
    .post("/register")
    .send({
      name: "Another User",
      email: "other@example.com",
      password: "Test@1234",
      role: "admin",
    })
    .expect(201);
  assert.equal(r.body.user.role, "user");
  const otherToken = r.body.token;
  const list = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${otherToken}`)
    .expect(200);
  assert.equal(list.body.total, 0);
  await request(app)
    .put(`/tasks/${taskId}`)
    .set("Authorization", `Bearer ${otherToken}`)
    .send({ title: "Unauthorized" })
    .expect(404);
});
test("returns 404s and deletes a task", async () => {
  await request(app)
    .get("/tasks/not-an-id")
    .set("Authorization", `Bearer ${token}`)
    .expect(404);
  await request(app).get("/does-not-exist").expect(404);
  await request(app)
    .delete(`/tasks/${taskId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
  await request(app)
    .get(`/tasks/${taskId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(404);
});
