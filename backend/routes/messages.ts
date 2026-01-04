
import { Router } from 'express';
import { sendMessage, getConversations, getMessagesWithUser, markAsRead, getUnreadCount } from '../controllers/messageController';
import auth from '../middleware/auth';
const router = Router();


router.post('/', auth, sendMessage);
router.get('/conversations', auth, getConversations);
router.get('/unread-count', auth, getUnreadCount);
router.get('/:userId', auth, getMessagesWithUser);
router.put('/:messageId/read', auth, markAsRead);

export default router;
