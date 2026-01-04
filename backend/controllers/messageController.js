const Message = require('../models/Message');
const User = require('../models/User');
const Store = require('../models/Store');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, storeId, content } = req.body;
    
    if (!content || !receiverId) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      store: storeId || null,
      content,
    });

    await message.populate('sender', 'name profileImage');
    await message.populate('receiver', 'name profileImage');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

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
    res.status(500).json({ message: error.message });
  }
};

// Get messages with a user
exports.getMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

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
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
