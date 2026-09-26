import express from "express";
import { protect } from "../middleware/auth.js";
import Goal from "../models/Goal.js";

const router = express.Router();

// @route   GET /api/goals/types
router.get("/types", protect, async (req, res) => {
  res.json(["weight", "workout", "calories", "running", "lifting", "custom"]);
});

// @route   GET /api/goals
router.get("/", protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status && status !== "all") {
      filter.status = status;
    }
    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching goals" });
  }
});

// @route   POST /api/goals
router.post("/", protect, async (req, res) => {
  try {
    const goal = await Goal.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create goal" });
  }
});

// @route   GET /api/goals/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error fetching goal" });
  }
});

// @route   PUT /api/goals/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update goal" });
  }
});

// @route   DELETE /api/goals/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting goal" });
  }
});

export default router;
