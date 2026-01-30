import Message from '../../../models/Message';

export async function sendMessage(input: {
  senderId: string;
  receiverId: string;
  storeId?: string;
  content: string;
  clientMessageId?: string;
}) {
  if (input.clientMessageId) {
    const existing: any = await Message.findOne({
      sender: input.senderId,
      clientMessageId: input.clientMessageId,
    });

    if (existing) {
      await existing.populate('sender', 'name profileImage');
      await existing.populate('receiver', 'name profileImage');
      await existing.populate('store', 'name logo');
      return existing;
    }
  }

  const message: any = await Message.create({
    sender: input.senderId,
    receiver: input.receiverId,
    store: input.storeId || null,
    content: input.content,
    clientMessageId: input.clientMessageId || null,
  });

  await message.populate('sender', 'name profileImage');
  await message.populate('receiver', 'name profileImage');
  await message.populate('store', 'name logo');

  return message;
}

export async function getConversations(userId: string) {
  const messages: any[] = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .populate('store', 'name logo')
    .sort({ createdAt: -1 });

  const conversationsMap = new Map<string, any>();

  messages.forEach((message: any) => {
    const partnerId = message.sender._id.equals(userId)
      ? message.receiver._id.toString()
      : message.sender._id.toString();

    if (!conversationsMap.has(partnerId)) {
      const partner = message.sender._id.equals(userId) ? message.receiver : message.sender;

      conversationsMap.set(partnerId, {
        user: partner,
        store: message.store,
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
        unreadCount: 0,
      });
    }

    if (!message.isRead && message.receiver._id.equals(userId)) {
      conversationsMap.get(partnerId)!.unreadCount++;
    }
  });

  return Array.from(conversationsMap.values());
}

export async function getMessagesWithUser(currentUserId: string, otherUserId: string) {
  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUserId },
    ],
  })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .populate('store', 'name logo')
    .sort({ createdAt: 1 });

  await Message.updateMany(
    { sender: otherUserId, receiver: currentUserId, isRead: false },
    { isRead: true }
  );

  return messages;
}

export async function markAsRead(messageId: string) {
  return await Message.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
}

export async function getUnreadCount(userId: string) {
  const count = await Message.countDocuments({ receiver: userId, isRead: false });
  return { count };
}
