const router = require('express').Router();
const { getNotifications, markRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/read', protect, markRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
