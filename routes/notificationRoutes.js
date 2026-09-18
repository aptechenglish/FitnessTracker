import express from "express";
import { protect } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// @route   GET /api/notifications/unread
router.get("/unread", protect, async (req, res) => {
  try {
    const unread = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    res.json({ unread });
  } catch (error) {
    res.status(500).json({ message: "Error fetching unread count" });
  }
});

// @route   POST /api/notifications/read-all
router.post("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error marking all read" });
  }
});

// @route   PUT /api/notifications/:id/read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
});

// @route   GET /api/notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// @route   POST /api/notifications
router.post("/", protect, async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create notification" });
  }
});

// @route   DELETE /api/notifications/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification" });
  }
});

export default router;
