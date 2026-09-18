import express from "express";
import { protect } from "../middleware/auth.js";
import Workout from "../models/Workout.js";
import Food from "../models/Food.js";
import Goal from "../models/Goal.js";
import Measurement from "../models/Measurement.js";

const router = express.Router();

// @route   GET /api/dashboard
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Dates for today & week
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const effectiveStart = startOfToday < startOfTodayUTC ? startOfToday : startOfTodayUTC;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Queries
    const [workouts, todayFoods, allRecentFoods, weekWorkouts, goals, latestMeasurement, totalWorkoutsCount] =
      await Promise.all([
        Workout.find({ user: userId }).sort({ date: -1 }).limit(5),
        Food.find({ user: userId, date: { $gte: effectiveStart } }).sort({ date: -1 }),
        Food.find({ user: userId }).sort({ date: -1 }).limit(5),
        Workout.find({ user: userId, date: { $gte: sevenDaysAgo } }),
        Goal.find({ user: userId }).limit(4),
        Measurement.findOne({ user: userId }).sort({ date: -1 }),
        Workout.countDocuments({ user: userId }),
      ]);

    // Today calories & macros
    const todayCalories = todayFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
    const todayProtein = todayFoods.reduce((acc, f) => acc + (f.protein || 0), 0);
    const todayCarbs = todayFoods.reduce((acc, f) => acc + (f.carbs || 0), 0);
    const todayFats = todayFoods.reduce((acc, f) => acc + (f.fats || 0), 0);

    // Weekly activity per day
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const dayWorkouts = weekWorkouts.filter(
        (w) => new Date(w.date) >= dayStart && new Date(w.date) <= dayEnd
      );
      const cals = dayWorkouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
      const mins = dayWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0);

      weeklyActivity.push({
        day: days[dayStart.getDay()],
        date: dayStart.toISOString().split("T")[0],
        calories: cals,
        minutes: mins,
        workouts: dayWorkouts.length,
      });
    }

    // Weekly calories burned total
    const weeklyCaloriesBurned = weekWorkouts.reduce(
      (acc, w) => acc + (w.caloriesBurned || 0),
      0
    );

    res.json({
      totalWorkouts: totalWorkoutsCount,
      weeklyCaloriesBurned,
      todayCalories,
      todayProtein,
      todayCarbs,
      todayFats,
      currentWeight: latestMeasurement?.weight || req.user.weight || 75,
      targetWeight: req.user.targetWeight || 72,
      targetCalories: req.user.targetCalories || 2400,
      recentWorkouts: workouts,
      recentNutrition: todayFoods.length > 0 ? todayFoods.slice(0, 5) : allRecentFoods,
      weeklyActivity,
      goals,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error fetching dashboard summary" });
  }
});

export default router;
