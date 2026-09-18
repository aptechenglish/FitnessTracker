import express from "express";
import { protect } from "../middleware/auth.js";
import Workout from "../models/Workout.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// @route   GET /api/workouts/categories
router.get("/categories", protect, async (req, res) => {
  res.json(["strength", "cardio", "hiit", "flexibility", "crossfit", "other"]);
});

// @route   GET /api/workouts/stats
router.get("/stats", protect, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id });
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);

    const categoryBreakdown = workouts.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalWorkouts,
      totalDuration,
      totalCalories,
      averageDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout stats" });
  }
});

// @route   GET /api/workouts
router.get("/", protect, async (req, res) => {
  try {
    const { category, search, sort = "-date" } = req.query;
    const filter = { user: req.user._id };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const workouts = await Workout.find(filter).sort(sort);
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workouts" });
  }
});

// @route   POST /api/workouts
router.post("/", protect, async (req, res) => {
  try {
    const workout = await Workout.create({
      ...req.body,
      user: req.user._id,
    });
    const isScheduled = workout.status === "scheduled";
    await Notification.create({
      user: req.user._id,
      title: isScheduled ? "Workout Scheduled" : "Workout Added",
      message: `"${workout.title}" was ${isScheduled ? "scheduled" : "added to your routine"}.`,
      type: "workout",
      link: "/workouts",
    });
    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create workout" });
  }
});

// @route   GET /api/workouts/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workout" });
  }
});

// @route   PUT /api/workouts/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update workout" });
  }
});

// @route   DELETE /api/workouts/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.json({ message: "Workout deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting workout" });
  }
});

export default router;
