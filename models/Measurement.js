import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    weight: {
      type: Number,
      default: 0,
    },
    bodyFat: {
      type: Number,
      default: 0,
    },
    measurements: {
      chest: { type: Number, default: 0 },
      waist: { type: Number, default: 0 },
      hips: { type: Number, default: 0 },
      armsLeft: { type: Number, default: 0 },
      armsRight: { type: Number, default: 0 },
      thighsLeft: { type: Number, default: 0 },
      thighsRight: { type: Number, default: 0 },
      neck: { type: Number, default: 0 },
      calvesLeft: { type: Number, default: 0 },
      calvesRight: { type: Number, default: 0 },
    },
    running: {
      distance: { type: Number, default: 0 },
      timeMinutes: { type: Number, default: 0 },
      pacePerKm: { type: Number, default: 0 },
    },
    lifting: {
      benchPress: { type: Number, default: 0 },
      deadlift: { type: Number, default: 0 },
      squat: { type: Number, default: 0 },
      overheadPress: { type: Number, default: 0 },
    },
    other: {
      dailySteps: { type: Number, default: 0 },
      sleepHours: { type: Number, default: 0 },
      caloriesBurned: { type: Number, default: 0 },
      restHeartRate: { type: Number, default: 0 },
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Measurement = mongoose.model("Measurement", measurementSchema);
export default Measurement;