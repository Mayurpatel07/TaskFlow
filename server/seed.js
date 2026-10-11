import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Task from "./models/Task.js";
export async function seed() {
  const fixtures = [
    {
      name: "Alex Morgan",
      email: "testuser@example.com",
      password: "Test@1234",
      role: "user",
    },
    {
      name: "Jordan Lee",
      email: "admin@example.com",
      password: "Admin@1234",
      role: "admin",
    },
  ];
  for (const f of fixtures) {
    if (!(await User.exists({ email: f.email })))
      await User.create({ ...f, password: await bcrypt.hash(f.password, 12) });
  }
  const u = await User.findOne({ email: fixtures[0].email });
  const admin = await User.findOne({ email: fixtures[1].email });
  if (!(await Task.exists({ createdBy: u.id }))) {
    const titles = [
      "Map the onboarding journey",
      "Review the design system",
      "Build authentication flow",
      "Write API integration tests",
      "Prepare launch checklist",
      "Polish mobile layouts",
    ];
    await Task.insertMany(
      titles.map((title, i) => ({
        title,
        description: [
          "Outline the first-run experience and identify the moments that matter.",
          "Keep components consistent, accessible and easy to reuse.",
          "Connect secure sign-in with a clear and friendly interface.",
        ][i % 3],
        priority: ["high", "medium", "low"][i % 3],
        status: ["in-progress", "pending", "completed"][i % 3],
        dueDate: new Date(Date.now() + (i + 1) * 86400000),
        assignedUser: i % 2 ? admin.id : u.id,
        createdBy: u.id,
      })),
    );
  }
}
if (process.argv[1]?.endsWith("seed.js")) {
  await connectDB();
  await seed();
  await mongoose.disconnect();
}
