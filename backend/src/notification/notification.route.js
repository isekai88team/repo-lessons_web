const express = require("express");
const router = express.Router();
const {
  createNotification,
  getAllNotifications,
  getActiveNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} = require("./notification.controller");

router.post("/", createNotification);
router.get("/", getAllNotifications);
router.get("/active", getActiveNotifications);
router.get("/:id", getNotificationById);
router.put("/:id", updateNotification);
router.delete("/:id", deleteNotification);

module.exports = router;
