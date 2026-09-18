import express from "express";
import { protect } from "../middleware/auth.js";
import Settings from "../models/Settings.js";

const router = express.Router();

const DEFAULTS = {
  notificationPreferences: {
    email: true,
    workoutReminders: true,
    mealReminders: true,
    goalAchievements: true,
  },
  units: { weight: "kg", height: "cm" },
  theme: "dark",
};

// @route   GET /api/settings
router.get("/", protect, async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings || !settings.notificationPreferences || !settings.units) {
      settings = await Settings.findOneAndUpdate(
        { user: req.user._id },
        { $set: DEFAULTS },
        { new: true, upsert: true }
      );
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings" });
  }
});

// @route   PUT /api/settings
router.put("/", protect, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: "Error updating settings" });
  }
});

export default router;
