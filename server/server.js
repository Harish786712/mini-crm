require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const User = require("./models/User");
const Customer = require("./models/Customer");
const Deal = require("./models/Deal");
const Task = require("./models/Task");
const auth = require("./middleware/auth");
const validate = require("./middleware/validate");
const { registerSchema, loginSchema, customerSchema, dealSchema, taskSchema } = require("./validation");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map(s => s.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const err = new Error("CORS blocked");
    err.status = 403;
    return callback(err);
  },
  credentials: true
}));
app.use(express.json({ limit: "200kb" }));
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true });

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/auth/register", authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ name: req.body.name, email: req.body.email, passwordHash });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

app.post("/api/auth/login", authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.get("/api/auth/me", auth, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

// Customers
app.get("/api/customers", auth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];

    const [items, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Customer.countDocuments(filter)
    ]);
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

app.post("/api/customers", auth, validate(customerSchema), async (req, res, next) => {
  try {
    const customer = await Customer.create({ ...req.body, userId: req.user._id });
    res.status(201).json(customer);
  } catch (e) { next(e); }
});

app.get("/api/customers/:id", auth, async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    const [deals, tasks] = await Promise.all([
      Deal.find({ customerId: customer._id, userId: req.user._id }).sort({ createdAt: -1 }),
      Task.find({ customerId: customer._id, userId: req.user._id }).sort({ dueDate: 1 })
    ]);
    res.json({ customer, deals, tasks });
  } catch (e) { next(e); }
});

app.patch("/api/customers/:id", auth, validate(customerSchema.partial()), async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (e) { next(e); }
});

app.delete("/api/customers/:id", auth, async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    await Deal.deleteMany({ customerId: customer._id, userId: req.user._id });
    await Task.deleteMany({ customerId: customer._id, userId: req.user._id });
    res.json({ message: "Customer deleted" });
  } catch (e) { next(e); }
});

// Deals
app.get("/api/deals", auth, async (req, res, next) => {
  try {
    const deals = await Deal.find({ userId: req.user._id })
      .populate("customerId", "name company").sort({ createdAt: -1 });
    res.json(deals);
  } catch (e) { next(e); }
});

app.post("/api/deals", auth, validate(dealSchema), async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.body.customerId, userId: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    const deal = await Deal.create({ ...req.body, userId: req.user._id });
    res.status(201).json(await deal.populate("customerId", "name company"));
  } catch (e) { next(e); }
});

app.patch("/api/deals/:id", auth, validate(dealSchema.partial()), async (req, res, next) => {
  try {
    if (req.body.customerId) {
      const customer = await Customer.findOne({ _id: req.body.customerId, userId: req.user._id });
      if (!customer) return res.status(404).json({ message: "Customer not found" });
    }
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body }, { new: true, runValidators: true }
    ).populate("customerId", "name company");
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json(deal);
  } catch (e) { next(e); }
});

app.delete("/api/deals/:id", auth, async (req, res, next) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    await Task.deleteMany({ dealId: deal._id, userId: req.user._id });
    res.json({ message: "Deal deleted" });
  } catch (e) { next(e); }
});

// Tasks
app.get("/api/tasks", auth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .populate("customerId", "name company")
      .populate("dealId", "title")
      .sort({ dueDate: 1 });
    res.json(tasks.map(t => ({
      ...t.toObject(),
      overdue: !t.done && new Date(t.dueDate) < new Date()
    })));
  } catch (e) { next(e); }
});

app.post("/api/tasks", auth, validate(taskSchema), async (req, res, next) => {
  try {
    if (req.body.customerId) {
      const c = await Customer.findOne({ _id: req.body.customerId, userId: req.user._id });
      if (!c) return res.status(404).json({ message: "Customer not found" });
    }
    if (req.body.dealId) {
      const d = await Deal.findOne({ _id: req.body.dealId, userId: req.user._id });
      if (!d) return res.status(404).json({ message: "Deal not found" });
    }
    const task = await Task.create({ ...req.body, userId: req.user._id });
    res.status(201).json(task);
  } catch (e) { next(e); }
});

app.patch("/api/tasks/:id", auth, validate(taskSchema.partial()), async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body }, { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (e) { next(e); }
});

app.delete("/api/tasks/:id", auth, async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (e) { next(e); }
});

// Dashboard aggregation
app.get("/api/dashboard", auth, async (req, res, next) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user._id);
    const start = new Date();
    start.setDate(1); start.setHours(0,0,0,0);
    const dayStart = new Date(); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

    const [customerCount, pipeline, wonMonth, dueToday, overdue] = await Promise.all([
      Customer.countDocuments({ userId: uid }),
      Deal.aggregate([
        { $match: { userId: uid, stage: { $nin: ["Won", "Lost"] } } },
        { $group: { _id: "$stage", value: { $sum: "$value" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Deal.aggregate([
        { $match: { userId: uid, stage: "Won", updatedAt: { $gte: start } } },
        { $group: { _id: null, value: { $sum: "$value" }, count: { $sum: 1 } } }
      ]),
      Task.countDocuments({ userId: uid, done: false, dueDate: { $gte: dayStart, $lt: dayEnd } }),
      Task.countDocuments({ userId: uid, done: false, dueDate: { $lt: new Date() } })
    ]);

    res.json({
      totalCustomers: customerCount,
      openPipelineValue: pipeline.reduce((a, x) => a + x.value, 0),
      dealsWonThisMonth: wonMonth[0]?.count || 0,
      tasksDueToday: dueToday,
      overdueTasks: overdue,
      pipeline
    });
  } catch (e) { next(e); }
});

app.use((err, req, res, next) => {
  if (err && err.status === 403) return res.status(403).json({ message: "Origin blocked" });
  if (err?.code === 11000) return res.status(400).json({ message: "Duplicate value" });
  if (err?.name === "CastError") return res.status(400).json({ message: "Invalid id" });
  console.error("API error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      app.listen(process.env.PORT || 5000, () => {});
    })
    .catch(() => process.exit(1));
}

module.exports = app;
