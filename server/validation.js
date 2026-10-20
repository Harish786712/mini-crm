const { z } = require("zod");

const email = z.string().trim().email();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email,
  password: z.string().min(1)
});

const customerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().min(1).max(120),
  email,
  phone: z.string().trim().max(40).optional().default(""),
  status: z.enum(["active", "inactive", "lead"]).default("active"),
  notes: z.string().max(2000).optional().default("")
});

const dealSchema = z.object({
  customerId: objectId,
  title: z.string().trim().min(2).max(150),
  value: z.coerce.number().min(0),
  stage: z.enum(["Lead", "Qualified", "Proposal", "Won", "Lost"]),
  expectedCloseDate: z.coerce.date()
});

const taskSchema = z.object({
  customerId: objectId.nullable().optional().default(null),
  dealId: objectId.nullable().optional().default(null),
  title: z.string().trim().min(2).max(200),
  dueDate: z.coerce.date(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  done: z.boolean().default(false)
});

module.exports = { registerSchema, loginSchema, customerSchema, dealSchema, taskSchema };
