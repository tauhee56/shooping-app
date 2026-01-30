import { Router } from 'express';
import auth from '../../middleware/auth';
import { validate } from '../../common/http/validate';
import * as controller from './messages.controller';
import { messageIdSchema, sendMessageSchema, userIdSchema } from './messages.validation';

const router = Router();

router.post('/', auth, validate(sendMessageSchema), controller.sendMessage);
router.get('/conversations', auth, controller.getConversations);
router.get('/unread-count', auth, controller.getUnreadCount);
router.get('/:userId', auth, validate(userIdSchema), controller.getMessagesWithUser);
router.put('/:messageId/read', auth, validate(messageIdSchema), controller.markAsRead);

export default router;
