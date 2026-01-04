const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getMessagesWithUser,
  markAsRead,
  getUnreadCount,
} = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.post('/', auth, sendMessage);
router.get('/conversations', auth, getConversations);
router.get('/unread-count', auth, getUnreadCount);
router.get('/:userId', auth, getMessagesWithUser);
router.put('/:messageId/read', auth, markAsRead);

module.exports = router;
