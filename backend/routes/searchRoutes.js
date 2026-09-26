import express from "express";
import { protect } from "../middleware/auth.js";
import Workout from "../models/Workout.js";
import Food from "../models/Food.js";
import User from "../models/User.js";

const router = express.Router();

const periodCutoff = (period) => {
  const days = period === "week" ? 7 : period === "month" ? 30 : 365;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

// @route   GET /api/search
router.get("/", protect, async (req, res) => {
  try {
    const {
      q = "",
      type = "all",
      category = "",
      exercise = "",
      mealType = "",
      period = "",
    } = req.query;

    const userId = req.user._id;
    const qRegex = q.trim() ? { $regex: q.trim(), $options: "i" } : null;

    let workouts = [];
    let foods = [];
    let users = [];

    if (!type || type === "all" || type === "workouts") {
      const match = { user: userId };
      if (qRegex) match.$or = [{ title: qRegex }, { category: qRegex }];
      if (category) match.category = category;
      if (exercise.trim()) {
        match.exercises = {
          $elemMatch: { name: { $regex: exercise.trim(), $options: "i" } },
        };
      }
      if (period) match.date = { $gte: periodCutoff(period) };
      workouts = await Workout.find(match).sort({ date: -1 });
    }

    if (!type || type === "all" || type === "nutrition" || type === "foods") {
      const match = { user: userId };
      if (qRegex) match.$or = [{ name: qRegex }, { mealType: qRegex }];
      if (mealType) match.mealType = mealType;
      if (period) match.date = { $gte: periodCutoff(period) };
      foods = await Food.find(match).sort({ date: -1 });
    }

    if (!type || type === "all" || type === "users") {
      if (qRegex) {
        users = await User.find({ $or: [{ name: qRegex }, { username: qRegex }] })
          .select("-password");
      }
    }

    res.json({ workouts, foods, users });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search error" });
  }
});

export default router;