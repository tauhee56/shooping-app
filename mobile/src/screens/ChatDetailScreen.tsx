import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { messageAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { getErrorMessage, getErrorTitle } from '../utils/errorMapper';
import { connectSocket } from '../utils/socket';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const ChatDetailScreen = ({ navigation, route }) => {
  const { userId, userName, userImage, storeId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const { user } = useContext(AuthContext);

  const isValidImageUri = (uri: any) => typeof uri === 'string' && uri.trim().length > 0;

  const currentUserId = (user as any)?._id || (user as any)?.id;

  useEffect(() => {
    let active = true;
    let socket: any;

    const onNewMessage = (payload: any) => {
      const msg = payload?.message;
      if (!msg) return;

      const senderId = String(msg?.sender?._id || msg?.sender || '');
      const receiverId = String(msg?.receiver?._id || msg?.receiver || '');
      const otherId = String(userId || '');
      const meId = String(currentUserId || '');

      if (meId) {
        const isThisChat =
          (senderId === meId && receiverId === otherId) || (senderId === otherId && receiverId === meId);
        if (!isThisChat) return;
      } else {
        const isThisChat = senderId === otherId || receiverId === otherId;
        if (!isThisChat) return;
      }

      setMessages((prev: any[]) => {
        const list = Array.isArray(prev) ? prev : [];
        const exists = list.some(
          (m: any) =>
            String(m?._id) === String(msg?._id) ||
            (!!msg?.clientMessageId && String(m?.clientMessageId || m?._id) === String(msg.clientMessageId))
        );
        if (exists) {
          return list.map((m: any) => {
            if (!!msg?.clientMessageId && String(m?.clientMessageId || m?._id) === String(msg.clientMessageId)) {
              return msg;
            }
            return m;
          });
        }
        return [...list, msg];
      });
    };

    const setup = async () => {
      try {
        socket = await connectSocket();
        if (!active || !socket) return;
        socket.emit('conversation:join', { otherUserId: userId });
        socket.on('message:new', onNewMessage);
      } catch {
      }
    };

    setup();

    return () => {
      active = false;
      if (socket) {
        socket.emit('conversation:leave', { otherUserId: userId });
        socket.off('message:new', onNewMessage);
      }
    };
  }, [userId, currentUserId]);

  useEffect(() => {
    loadMessages();
  }, [userId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageAPI.getMessagesWithUser(userId);
      setMessages(response.data);
    } catch (error) {
      setMessages([]);
      setError(getErrorMessage(error, 'Failed to load messages'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const messageText = newMessage.trim();
    if (!messageText) return;

    const clientMessageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const tempMessage = {
      _id: clientMessageId,
      content: messageText,
      sender: { _id: currentUserId || '' },
      receiver: { _id: userId },
      clientMessageId,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');

    try {
      setSending(true);
      let saved: any = null;
      try {
        const socket = await connectSocket();
        if (socket && socket.connected) {
          saved = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('timeout')), 6000);
            socket.emit(
              'message:send',
              {
                receiverId: userId,
                storeId: storeId || null,
                content: messageText,
                clientMessageId,
              },
              (res: any) => {
                clearTimeout(timeout);
                if (res?.ok && res?.message) resolve(res.message);
                else reject(new Error(res?.error || 'Failed'));
              }
            );
          });
        }
      } catch {
        saved = null;
      }

      if (!saved) {
        const response = await messageAPI.sendMessage({
          receiverId: userId,
          storeId: storeId || null,
          content: messageText,
          clientMessageId,
        });
        saved = response.data;
      }

      setMessages((prev: any[]) =>
        (Array.isArray(prev) ? prev : []).map((m: any) =>
          String(m?.clientMessageId || m?._id) === String(clientMessageId) ? saved : m
        )
      );
    } catch (error) {
      // Remove temp message on error
      setMessages((prev: any[]) => (Array.isArray(prev) ? prev : []).filter((m: any) => String(m?._id) !== String(tempMessage._id)));
      Alert.alert(
        getErrorTitle(error, 'Failed to send message'),
        getErrorMessage(error, 'Failed to send message')
      );
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = currentUserId
      ? String(item?.sender?._id) === String(currentUserId)
      : false;
    const time = new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.userMessage : styles.storeMessage]}>
        {!isCurrentUser &&
          (isValidImageUri(userImage) ? (
            <Image source={{ uri: userImage }} style={styles.messageAvatar} />
          ) : (
            <View style={styles.messageAvatar} />
          ))}
        <View style={[styles.messageBubble, isCurrentUser ? styles.userBubble : styles.storeBubble]}>
          <Text style={[styles.messageText, isCurrentUser && styles.userMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isCurrentUser && styles.userMessageTime]}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <Text style={{ color: COLORS.secondary, fontWeight: '600', fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={loadMessages}
            style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10, marginBottom: 10 }}
          >
            <Text style={{ color: COLORS.white, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            {isValidImageUri(userImage) ? (
              <Image source={{ uri: userImage }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatar} />
            )}
            <View>
              <Text style={styles.headerTitle}>{userName}</Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <MaterialIcons name="attach-file" size={24} color={COLORS.gray} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.gray}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
          </View>
          <TouchableOpacity 
            style={[styles.sendButton, (!newMessage.trim() || sending) && { opacity: 0.5 }]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <MaterialIcons name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  storeMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  storeBubble: {
    backgroundColor: COLORS.light,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.white,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachButton: {
    marginRight: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.light,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  input: {
    fontSize: 14,
    color: COLORS.secondary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default ChatDetailScreen;
