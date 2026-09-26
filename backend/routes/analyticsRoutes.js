import express from "express";
import { protect } from "../middleware/auth.js";
import Workout from "../models/Workout.js";
import Food from "../models/Food.js";

const router = express.Router();

// Helper to get date threshold
const getStartDate = (period) => {
  const d = new Date();
  if (period === "month") d.setMonth(d.getMonth() - 1);
  else if (period === "year") d.setFullYear(d.getFullYear() - 1);
  else d.setDate(d.getDate() - 7); // default 7d
  d.setHours(0, 0, 0, 0);
  return d;
};

// @route   GET /api/analytics/workouts
router.get("/workouts", protect, async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const startDate = getStartDate(period);

    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);

    const categoryDistribution = workouts.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] || 0) + 1;
      return acc;
    }, {});

    const timeline = workouts.map((w) => ({
      date: w.date.toISOString().split("T")[0],
      duration: w.duration,
      calories: w.caloriesBurned,
      title: w.title,
    }));

    res.json({
      period,
      totalWorkouts,
      totalDuration,
      totalCalories,
      categoryDistribution,
      timeline,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout analytics" });
  }
});

// @route   GET /api/analytics/nutrition
router.get("/nutrition", protect, async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const startDate = getStartDate(period);

    const foods = await Food.find({
      user: req.user._id,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const totalCalories = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
    const totalProtein = foods.reduce((acc, f) => acc + (f.protein || 0), 0);
    const totalCarbs = foods.reduce((acc, f) => acc + (f.carbs || 0), 0);
    const totalFats = foods.reduce((acc, f) => acc + (f.fats || 0), 0);

    // Aggregate by day
    const dailyMap = {};
    foods.forEach((f) => {
      const day = f.date.toISOString().split("T")[0];
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, calories: 0, protein: 0, carbs: 0, fats: 0 };
      }
      dailyMap[day].calories += f.calories || 0;
      dailyMap[day].protein += f.protein || 0;
      dailyMap[day].carbs += f.carbs || 0;
      dailyMap[day].fats += f.fats || 0;
    });

    res.json({
      period,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      dailyTrend: Object.values(dailyMap),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching nutrition analytics" });
  }
});

export default router;
