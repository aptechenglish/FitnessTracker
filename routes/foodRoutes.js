import express from "express";
import { protect } from "../middleware/auth.js";
import Food from "../models/Food.js";

const router = express.Router();

// @route   GET /api/foods/stats
router.get("/stats", protect, async (req, res) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const foods = await Food.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const totalCalories = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
    const totalProtein = foods.reduce((acc, f) => acc + (f.protein || 0), 0);
    const totalCarbs = foods.reduce((acc, f) => acc + (f.carbs || 0), 0);
    const totalFats = foods.reduce((acc, f) => acc + (f.fats || 0), 0);

    const mealBreakdown = {
      breakfast: foods.filter((f) => f.mealType === "breakfast"),
      lunch: foods.filter((f) => f.mealType === "lunch"),
      dinner: foods.filter((f) => f.mealType === "dinner"),
      snack: foods.filter((f) => f.mealType === "snack"),
    };

    res.json({
      date: startOfDay.toISOString().split("T")[0],
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      targetCalories: req.user.targetCalories || 2400,
      mealBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching food stats" });
  }
});

// @route   GET /api/foods
router.get("/", protect, async (req, res) => {
  try {
    const { date, mealType, search } = req.query;
    const filter = { user: req.user._id };

    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    }

    if (mealType && mealType !== "all") {
      filter.mealType = mealType;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const foods = await Food.find(filter).sort({ date: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Error fetching food entries" });
  }
});

// @route   POST /api/foods
router.post("/", protect, async (req, res) => {
  try {
    const food = await Food.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to log food" });
  }
});

// @route   PUT /api/foods/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const food = await Food.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!food) {
      return res.status(404).json({ message: "Food entry not found" });
    }
    res.json(food);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update food" });
  }
});

// @route   DELETE /api/foods/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const food = await Food.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!food) {
      return res.status(404).json({ message: "Food entry not found" });
    }
    res.json({ message: "Food entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting food entry" });
  }
});

export default router;
