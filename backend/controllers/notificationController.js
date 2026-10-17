const Notification = require('../models/Notification');

const MAX_NOTIFICATIONS = 50;

// FR: a reviewer can see the notifications created when their reviews are moderated,
// newest first, together with how many are still unread.
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(MAX_NOTIFICATIONS);
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Marks one notification as read. Only its owner may do this.
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own notifications.' });
    }

    notification.read = true;
    const updated = await notification.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
