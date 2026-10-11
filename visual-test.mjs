import { chromium } from "playwright";
import { MongoMemoryServer } from "./server/node_modules/mongodb-memory-server/index.js";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
const db = await MongoMemoryServer.create();
const api = spawn("node", ["index.js"], {
  cwd: "server",
  env: {
    ...process.env,
    MONGODB_URI: db.getUri(),
    JWT_SECRET: "local-visual-test-secret-with-at-least-32-chars",
    SEED_DEMO: "true",
    CLIENT_URL: "http://localhost:5173",
    PORT: "4000",
  },
  stdio: "pipe",
});
const vite = spawn("npm", ["run", "dev"], { cwd: "client", stdio: "pipe" });
let browser;
try {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch("http://localhost:4000/health");
      const v = await fetch("http://localhost:5173");
      if (r.ok && v.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:5173/login");
  await page.getByRole("heading", { name: "Welcome back." }).waitFor();
  await page.screenshot({
    path: "/downloads/taskflow-login.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Use member demo" }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("heading", { name: "Good to see you, Alex." }).waitFor();
  await page
    .getByRole("button", { name: "View Map the onboarding journey" })
    .waitFor();
  await page.screenshot({
    path: "/downloads/taskflow-dashboard.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "New task" }).click();
  await page.getByLabel("Task title", { exact: true }).fill("Visual E2E task");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Created in an actual browser.");
  await page.locator("select[name=priority]").selectOption("high");
  await page.getByLabel("Due date", { exact: true }).fill("2026-10-12");
  await page.screenshot({
    path: "/downloads/taskflow-create.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await page.getByLabel("Search tasks by title").fill("Visual E2E");
  await page.getByRole("button", { name: "View Visual E2E task" }).waitFor();
  await page.getByRole("button", { name: "View Visual E2E task" }).click();
  await page.getByRole("button", { name: "Edit task", exact: true }).click();
  await page.locator("select[name=status]").selectOption("completed");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("button", { name: "View Visual E2E task" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("heading", { name: "No tasks match your filters." })
    .waitFor();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page
    .getByRole("button", { name: "View Map the onboarding journey" })
    .waitFor();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.screenshot({
    path: "/downloads/taskflow-dark.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(
    () => document.querySelector(".sidebar").getBoundingClientRect().right <= 0,
  );
  await page.screenshot({
    path: "/downloads/taskflow-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Team", exact: true }).click();
  await page.getByRole("heading", { name: "A team, in sync." }).waitFor();
  console.log("Team OK");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  console.log("Logout OK");
  await page
    .getByRole("link", { name: "Create an account", exact: true })
    .click();
  console.log("Register page OK");
  await page.getByLabel("Your name").fill("Browser Evaluator");
  await page.getByLabel("Email address").fill("browser@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Browser@1234");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Good to see you, Browser." })
    .waitFor();
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(
    "PASS: visual desktop/mobile, no horizontal overflow, login, create/edit/delete, dark mode, team, logout, registration.",
  );
} finally {
  await browser?.close();
  api.kill("SIGTERM");
  vite.kill("SIGTERM");
  await db.stop();
}
