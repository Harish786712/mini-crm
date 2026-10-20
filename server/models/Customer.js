const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: "" },
  status: { type: String, enum: ["active", "inactive", "lead"], default: "active" },
  notes: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
