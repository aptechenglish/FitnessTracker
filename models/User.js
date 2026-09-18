import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    weight: {
      type: Number,
      default: 75,
    },
    height: {
      type: Number,
      default: 178,
    },
    age: {
      type: Number,
      default: 25,
    },
    dateOfBirth: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say", ""],
      default: "",
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "very_active", "extra_active", ""],
      default: "moderate",
    },
    targetWeight: {
      type: Number,
      default: 72,
    },
    targetCalories: {
      type: Number,
      default: 2400,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    fitnessGoal: {
      type: String,
      enum: ["lose_weight", "build_muscle", "maintain", "endurance", ""],
      default: "maintain",
    },
    dietaryPreference: {
      type: String,
      enum: ["standard", "high_protein", "vegetarian", "vegan", "keto", ""],
      default: "standard",
    },
    workoutFrequency: {
      type: String,
      enum: ["2-3", "4-5", "6+", ""],
      default: "4-5",
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
