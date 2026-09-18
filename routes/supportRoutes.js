import express from "express";
import { protect } from "../middleware/auth.js";
import Support from "../models/Support.js";

const router = express.Router();

// @route   GET /api/support/contact
router.get("/contact", (req, res) => {
  res.json({
    email: "support@irontemplefitness.com",
    phone: "+1 (800) 555-IRON",
    hours: "24/7 Dedicated Athlete Support",
  });
});

// @route   GET /api/support/tickets
router.get("/tickets", protect, async (req, res) => {
  try {
    const tickets = await Support.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching support tickets" });
  }
});

// @route   GET /api/support
router.get("/", protect, async (req, res) => {
  try {
    const tickets = await Support.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      tickets,
      faqs: [
        { q: "How do I calculate target macros?", a: "Go to Settings or Profile to adjust your fitness goals." },
        { q: "How to export workout records?", a: "Navigate to the Reports page to download CSV data." },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching support meta" });
  }
});

// @route   POST /api/support
router.post("/", protect, async (req, res) => {
  try {
    const ticket = await Support.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: "Failed to submit support request" });
  }
});

export default router;
