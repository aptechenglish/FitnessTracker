import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
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
    time: {
      type: String,
      required: true,
      default: "08:00",
    },
    days: {
      type: [String],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    type: {
      type: String,
      enum: ["workout", "meal", "water", "weight", "custom"],
      default: "workout",
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
