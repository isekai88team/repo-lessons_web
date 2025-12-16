const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error"],
      default: "info",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // For personal notifications to specific student
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    // Related worksheet for worksheet notifications
    relatedWorksheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worksheet",
    },
    // If recipient is null, it's a global notification
    isGlobal: {
      type: Boolean,
      default: true,
    },
    // Read status for personal notifications
    isRead: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
