import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["weight", "workout", "calories", "running", "lifting", "custom"],
      default: "weight",
    },
    targetValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: "kg",
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "failed", "paused"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
