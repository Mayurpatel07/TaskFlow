import { z } from "zod";
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[0-9]/, "Include a number")
    .regex(/[^A-Za-z0-9]/, "Include a symbol"),
});
export const loginSchema = z.object({
  email: z.email().transform((s) => s.toLowerCase()),
  password: z.string().min(1).max(72),
  rememberMe: z.boolean().optional(),
});
export const taskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(4000).default(""),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["pending", "in-progress", "completed"]).default("pending"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (s) =>
        !isNaN(new Date(s).getTime()) &&
        new Date(s).toISOString().slice(0, 10) === s,
      "Choose a valid date",
    ),
  assignedUser: z.string().regex(/^[a-f\d]{24}$/i),
});
export const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
export const parse = (schema, data) => {
  const r = schema.safeParse(data);
  if (!r.success) {
    const e = new Error(
      r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
    e.status = 400;
    throw e;
  }
  return r.data;
};
