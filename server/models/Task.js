const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", default: null },
  title: { type: String, required: true, trim: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  done: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
