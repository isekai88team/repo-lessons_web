const Notification = require("./notification.model");

// Create
const createNotification = async (req, res) => {
  try {
    const { title, message, type, isActive } = req.body;
    const notification = new Notification({
      title,
      message,
      type,
      isActive: isActive !== undefined ? isActive : true,
    });
    await notification.save();
    res.status(201).json({ message: "สร้างการแจ้งเตือนสำเร็จ", notification });
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error });
  }
};

// Read All (Admin) - Only global notifications for management
const getAllNotifications = async (req, res) => {
  try {
    // Only show global notifications in Admin panel (not personal student notifications)
    const notifications = await Notification.find({
      isGlobal: { $ne: false },
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

// Read Active (Public/Student)
const getActiveNotifications = async (req, res) => {
  try {
    const { studentId } = req.query;

    let query = { isActive: true };

    if (studentId) {
      // If studentId is provided, get global notifications OR personal notifications for this student
      // isGlobal: { $ne: false } matches true, undefined, or null (all treated as global)
      query = {
        isActive: true,
        $or: [
          { isGlobal: { $ne: false } }, // Global or not set (default global)
          { recipient: studentId, isGlobal: false }, // Personal notifications for this student
        ],
      };
    } else {
      // If no studentId, only return global notifications (including undefined/null)
      query = { isActive: true, isGlobal: { $ne: false } };
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching active notifications", error });
  }
};

// Get By ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notification", error });
  }
};

// Update
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "อัปเดตสำเร็จ", notification: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error });
  }
};

// Delete
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: "ลบสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error });
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
  getActiveNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
