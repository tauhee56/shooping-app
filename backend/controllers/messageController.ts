
import { Request, Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import Store from '../models/Store';

// Send message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, storeId, content } = req.body;
    
    if (!content || !receiverId) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const message = await Message.create({
      sender: req.user.userId,
      receiver: receiverId,
      store: storeId || null,
      content,
    });

    await message.populate('sender', 'name profileImage');
    await message.populate('receiver', 'name profileImage');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get conversations
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    // Get unique conversation partners
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .populate('store', 'name logo')
    .sort({ createdAt: -1 });

    // Group by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const partnerId = message.sender._id.equals(userId) 
        ? message.receiver._id.toString()
        : message.sender._id.toString();
      
      if (!conversationsMap.has(partnerId)) {
        const partner = message.sender._id.equals(userId) 
          ? message.receiver 
          : message.sender;
        
        conversationsMap.set(partnerId, {
          user: partner,
          store: message.store,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: 0,
        });
      }
      
      // Count unread messages
      if (!message.isRead && message.receiver._id.equals(userId)) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get messages with a user
export const getMessagesWithUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .populate('store', 'name logo')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Mark message as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Get unread count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.userId,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
