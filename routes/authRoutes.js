import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Workout from "../models/Workout.js";
import Food from "../models/Food.js";
import Goal from "../models/Goal.js";
import Measurement from "../models/Measurement.js";
import Notification from "../models/Notification.js";
import Reminder from "../models/Reminder.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "fitness_secret_iron_temple_vip_jwt_key_2026",
    { expiresIn: "30d" }
  );
};

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      gender,
      dateOfBirth,
      weight,
      height,
      targetWeight,
      activityLevel,
      fitnessGoal,
      dietaryPreference,
      workoutFrequency,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already in use" });
    }

    const userWeight = weight !== undefined ? Number(weight) : 75;
    const userHeight = height !== undefined ? Number(height) : 178;
    const userTargetWeight = targetWeight !== undefined ? Number(targetWeight) : userWeight;

    // Smart default target calories calculation
    let calculatedCalories = 2200;
    if (fitnessGoal === "lose_weight" || userTargetWeight < userWeight) {
      calculatedCalories = 1850;
    } else if (fitnessGoal === "build_muscle" || userTargetWeight > userWeight) {
      calculatedCalories = 2650;
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      name: name || username,
      gender: gender || "",
      dateOfBirth: dateOfBirth || "",
      weight: userWeight,
      height: userHeight,
      targetWeight: userTargetWeight,
      targetCalories: calculatedCalories,
      activityLevel: activityLevel || "moderate",
      fitnessGoal: fitnessGoal || "maintain",
      dietaryPreference: dietaryPreference || "standard",
      workoutFrequency: workoutFrequency || "4-5",
    });

    // Create initial welcome notification
    await Notification.create({
      user: user._id,
      title: "Welcome to Fitness Tracker!",
      message: "Your profile has been created. Start by tracking workouts, nutrition, or setting goals.",
      type: "system",
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      weight: user.weight,
      height: user.height,
      targetWeight: user.targetWeight,
      targetCalories: user.targetCalories,
      activityLevel: user.activityLevel,
      fitnessGoal: user.fitnessGoal,
      dietaryPreference: user.dietaryPreference,
      workoutFrequency: user.workoutFrequency,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Please provide credentials" });
    }

    const user = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const userObj = {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      weight: user.weight,
      height: user.height,
      age: user.age,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      activityLevel: user.activityLevel,
      targetWeight: user.targetWeight,
      targetCalories: user.targetCalories,
      profilePicture: user.profilePicture,
    };

    res.json({
      ...userObj,
      user: userObj,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// @route   GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error retrieving profile" });
  }
});

// @route   PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedUpdates = [
      "name",
      "bio",
      "weight",
      "height",
      "age",
      "dateOfBirth",
      "gender",
      "activityLevel",
      "targetWeight",
      "targetCalories",
      "profilePicture",
      "fitnessGoal",
      "dietaryPreference",
      "workoutFrequency",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.password && req.body.password.length >= 6) {
      user.password = req.body.password;
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      name: updated.name,
      bio: updated.bio,
      weight: updated.weight,
      height: updated.height,
      age: updated.age,
      dateOfBirth: updated.dateOfBirth,
      gender: updated.gender,
      activityLevel: updated.activityLevel,
      targetWeight: updated.targetWeight,
      targetCalories: updated.targetCalories,
      profilePicture: updated.profilePicture,
      fitnessGoal: updated.fitnessGoal,
      dietaryPreference: updated.dietaryPreference,
      workoutFrequency: updated.workoutFrequency,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// @route   DELETE /api/auth/sample-data
router.delete("/sample-data", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    await Promise.all([
      Workout.deleteMany({ user: userId }),
      Food.deleteMany({ user: userId }),
      Goal.deleteMany({ user: userId }),
      Measurement.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
      Reminder.deleteMany({ user: userId }),
    ]);
    res.json({ message: "Sample data cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove sample data" });
  }
});

export default router;
