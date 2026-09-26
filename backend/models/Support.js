import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "technical", "billing", "feedback", "feature"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    adminResponse: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Support = mongoose.model("Support", supportSchema);
export default Support;
