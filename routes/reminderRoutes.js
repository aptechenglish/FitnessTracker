import express from "express";
import { protect } from "../middleware/auth.js";
import Reminder from "../models/Reminder.js";

const router = express.Router();

// @route   GET /api/reminders
router.get("/", protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ time: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reminders" });
  }
});

// @route   POST /api/reminders
router.post("/", protect, async (req, res) => {
  try {
    const reminder = await Reminder.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create reminder" });
  }
});

// @route   PUT /api/reminders/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update reminder" });
  }
});

// @route   DELETE /api/reminders/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reminder" });
  }
});

export default router;
