import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  weight: { type: Number, default: 0 },
  image: { type: String, default: "" },
});

const workoutSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ["strength", "cardio", "hiit", "flexibility", "crossfit", "chest", "back", "legs", "shoulders", "arms", "core", "other"],
      default: "strength",
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 45,
    },
    caloriesBurned: {
      type: Number,
      required: true,
      default: 300,
    },
    intensity: {
      type: String,
      enum: ["low", "moderate", "high", "extreme"],
      default: "moderate",
    },
    exercises: [exerciseSchema],
    notes: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    scheduledDate: {
      type: Date,
    },
    scheduleType: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
    status: {
      type: String,
      enum: ["completed", "scheduled"],
      default: "completed",
    },
  },
  { timestamps: true }
);

const Workout = mongoose.model("Workout", workoutSchema);
export default Workout;
