import express from "express";
import { protect } from "../middleware/auth.js";
import Workout from "../models/Workout.js";
import Food from "../models/Food.js";

const router = express.Router();

const getThreshold = (period) => {
  const d = new Date();
  if (period === "month") d.setMonth(d.getMonth() - 1);
  else if (period === "year") d.setFullYear(d.getFullYear() - 1);
  else d.setDate(d.getDate() - 7);
  return d;
};

// @route   GET /api/reports/export/workouts
router.get("/export/workouts", protect, async (req, res) => {
  try {
    const { period } = req.query;
    const filter = { user: req.user._id };
    if (period && period !== "all") {
      filter.date = { $gte: getThreshold(period) };
    }

    const workouts = await Workout.find(filter).sort({ date: -1 });

    let csv = "Date,Title,Category,Duration (mins),Calories Burned,Intensity,Notes\n";
    workouts.forEach((w) => {
      const dateStr = w.date.toISOString().split("T")[0];
      const title = `"${(w.title || "").replace(/"/g, '""')}"`;
      const category = w.category || "";
      const duration = w.duration || 0;
      const calories = w.caloriesBurned || 0;
      const intensity = w.intensity || "";
      const notes = `"${(w.notes || "").replace(/"/g, '""')}"`;
      csv += `${dateStr},${title},${category},${duration},${calories},${intensity},${notes}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="workouts_export.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: "Failed to export workouts CSV" });
  }
});

// @route   GET /api/reports/export/nutrition
router.get("/export/nutrition", protect, async (req, res) => {
  try {
    const { period } = req.query;
    const filter = { user: req.user._id };
    if (period && period !== "all") {
      filter.date = { $gte: getThreshold(period) };
    }

    const foods = await Food.find(filter).sort({ date: -1 });

    let csv = "Date,Meal Type,Food Name,Calories,Protein (g),Carbs (g),Fats (g),Quantity,Unit\n";
    foods.forEach((f) => {
      const dateStr = f.date.toISOString().split("T")[0];
      const meal = f.mealType || "";
      const name = `"${(f.name || "").replace(/"/g, '""')}"`;
      const calories = f.calories || 0;
      const protein = f.protein || 0;
      const carbs = f.carbs || 0;
      const fats = f.fats || 0;
      const quantity = f.quantity || 1;
      const unit = f.unit || "serving";
      csv += `${dateStr},${meal},${name},${calories},${protein},${carbs},${fats},${quantity},${unit}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="nutrition_export.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: "Failed to export nutrition CSV" });
  }
});

// @route   GET /api/reports/pdf
router.get("/pdf", protect, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id });
    const foods = await Food.find({ user: req.user._id });

    // Provide formatted text summary or report
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="fitness_report.pdf"');
    res.status(200).send(Buffer.from(`%PDF-1.4 Fitness Report for ${req.user.name || req.user.username} - Total Workouts: ${workouts.length}, Total Food Logs: ${foods.length}`));
  } catch (error) {
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

export default router;
