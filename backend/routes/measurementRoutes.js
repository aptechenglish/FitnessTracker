import express from "express";
import { protect } from "../middleware/auth.js";
import Measurement from "../models/Measurement.js";

const router = express.Router();

// Convert empty strings to 0 for numeric fields so Mongoose doesn't reject them
const cleanNumbers = (obj) => {
  const out = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (value && typeof value === "object") {
      out[key] = cleanNumbers(value);
    } else if (value === "" && key !== "notes" && key !== "date") {
      out[key] = 0;
    } else {
      out[key] = value;
    }
  }
  return out;
};

const LIFT_KEYS = ["benchPress", "deadlift", "squat", "overheadPress"];

// @route   GET /api/measurements/progress
router.get("/progress", protect, async (req, res) => {
  try {
    const logs = await Measurement.find({ user: req.user._id }).sort({ date: 1 });

    const weights = logs
      .filter((l) => l.weight > 0)
      .map((l) => ({ date: l.date, value: l.weight }));

    const bodyFat = logs
      .filter((l) => l.bodyFat > 0)
      .map((l) => ({ date: l.date, value: l.bodyFat }));

    const measurements = logs.map((l) => {
      const m = l.measurements || {};
      return {
        date: l.date,
        chest: m.chest || 0,
        waist: m.waist || 0,
        hips: m.hips || 0,
        armsLeft: m.armsLeft || 0,
        armsRight: m.armsRight || 0,
        thighsLeft: m.thighsLeft || 0,
        thighsRight: m.thighsRight || 0,
        neck: m.neck || 0,
        calvesLeft: m.calvesLeft || 0,
        calvesRight: m.calvesRight || 0,
      };
    });

    const running = logs
      .map((l) => {
        const r = l.running || {};
        return {
          date: l.date,
          distance: r.distance || 0,
          timeMinutes: r.timeMinutes || 0,
          pacePerKm: r.pacePerKm || 0,
        };
      })
      .filter((r) => r.distance > 0);

    const lifting = {};
    LIFT_KEYS.forEach((key) => {
      lifting[key] = logs
        .filter((l) => ((l.lifting || {})[key] || 0) > 0)
        .map((l) => ({ date: l.date, value: l.lifting[key] }));
    });

    res.json({ weights, bodyFat, measurements, running, lifting });
  } catch (error) {
    res.status(500).json({ message: "Error fetching progress data" });
  }
});

// @route   GET /api/measurements
router.get("/", protect, async (req, res) => {
  try {
    const measurements = await Measurement.find({ user: req.user._id }).sort({ date: -1 });
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching measurements" });
  }
});

// @route   POST /api/measurements
router.post("/", protect, async (req, res) => {
  try {
    const body = cleanNumbers(req.body);
    const measurement = await Measurement.create({ ...body, user: req.user._id });
    res.status(201).json(measurement);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to save measurement" });
  }
});

// @route   PUT /api/measurements/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const body = cleanNumbers(req.body);
    const measurement = await Measurement.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: body },
      { new: true }
    );
    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }
    res.json(measurement);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update measurement" });
  }
});

// @route   DELETE /api/measurements/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const measurement = await Measurement.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }
    res.json({ message: "Measurement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting measurement" });
  }
});

export default router;