import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      workoutReminders: { type: Boolean, default: true },
      mealReminders: { type: Boolean, default: true },
      goalAchievements: { type: Boolean, default: true },
    },
    units: {
      weight: { type: String, enum: ["kg", "lb"], default: "kg" },
      height: { type: String, enum: ["cm", "in"], default: "cm" },
    },
    theme: {
      type: String,
      default: "dark",
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;