const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  title: { type: String, required: true, trim: true },
  value: { type: Number, required: true, min: 0 },
  stage: { type: String, enum: ["Lead", "Qualified", "Proposal", "Won", "Lost"], default: "Lead" },
  expectedCloseDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Deal", dealSchema);
