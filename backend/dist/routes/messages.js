"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.post('/', auth_1.default, messageController_1.sendMessage);
router.get('/conversations', auth_1.default, messageController_1.getConversations);
router.get('/unread-count', auth_1.default, messageController_1.getUnreadCount);
router.get('/:userId', auth_1.default, messageController_1.getMessagesWithUser);
router.put('/:messageId/read', auth_1.default, messageController_1.markAsRead);
exports.default = router;
