import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { messageAPI } from '../utils/api';
import { getErrorMessage } from '../utils/errorMapper';
import { connectSocket } from '../utils/socket';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const InboxScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('All');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isValidImageUri = (uri: any) => typeof uri === 'string' && uri.trim().length > 0;

  const inFlightRef = useRef(false);
  const lastFetchAtRef = useRef(0);

  const filteredConversations = useMemo(() => {
    const list = Array.isArray(conversations) ? conversations : [];
    if (selectedTab === 'Unread') {
      return list.filter((c: any) => (c?.unreadCount || 0) > 0);
    }
    if (selectedTab === 'Stores') {
      return list.filter((c: any) => !!(c?.store && (c.store._id || c.store.id)));
    }
    return list;
  }, [conversations, selectedTab]);

  const loadConversations = async (opts?: { force?: boolean }) => {
    if (inFlightRef.current) return;

    const now = Date.now();
    if (!opts?.force && now - lastFetchAtRef.current < 700) return;

    inFlightRef.current = true;
    lastFetchAtRef.current = now;
    try {
      setError(null);
      const response = await messageAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      setConversations([]);
      setError(getErrorMessage(error, 'Failed to load conversations'));
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    loadConversations({ force: true });
    const interval = globalThis.setInterval(() => loadConversations(), 10000); // Refresh every 10s
    return () => globalThis.clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadConversations();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let active = true;
    let socket: any;

    const handleConversationUpdate = (payload: any) => {
      const conv = payload?.conversation;
      const partnerId = conv?.user?._id || conv?.user?.id;
      if (!partnerId) return;

      setConversations((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const idx = list.findIndex((c: any) => String(c?.user?._id || c?.user?.id) === String(partnerId));
        const nextItem = {
          ...(idx >= 0 ? list[idx] : {}),
          ...conv,
        };
        const filtered = idx >= 0 ? list.filter((_: any, i: number) => i !== idx) : list;
        return [nextItem, ...filtered];
      });
    };

    const setup = async () => {
      try {
        socket = await connectSocket();
        if (!active || !socket) return;
        socket.on('conversation:update', handleConversationUpdate);
      } catch {
      }
    };

    setup();

    return () => {
      active = false;
      if (socket) {
        socket.off('conversation:update', handleConversationUpdate);
      }
    };
  }, []);

  const renderMessage = ({ item }) => {
    const time = (() => {
      try {
        if (!item?.lastMessageTime) return '';
        return new Date(item.lastMessageTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
      } catch {
        return '';
      }
    })();
    
    return (
      <TouchableOpacity 
        style={styles.messageItem}
        onPress={() => navigation.navigate('ChatDetail', {
          userId: item.user._id,
          userName: item.user.name,
          userImage: item.user.profileImage || '',
          storeId: item.store?._id,
        })}
      >
        <View style={styles.messageLeft}>
          {isValidImageUri(item?.user?.profileImage) ? (
            <Image 
              source={{ uri: item.user.profileImage }} 
              style={styles.storeAvatar} 
            />
          ) : (
            <View style={styles.storeAvatar} />
          )}
          {item.unreadCount > 0 && <View style={styles.onlineDot} />}
        </View>
        
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.storeName}>{item.user.name}</Text>
            <Text style={styles.messageTime}>{time}</Text>
          </View>
          <View style={styles.messageBottom}>
            <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
          <Text style={{ color: COLORS.secondary, fontWeight: '600', fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              loadConversations({ force: true });
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10 }}
          >
            <Text style={{ color: COLORS.white, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity>
          <MaterialIcons name="filter-list" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['All', 'Unread', 'Stores'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons name="chat-bubble-outline" size={60} color={COLORS.gray} />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        )}
      />

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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.light,
  },
  tabActive: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  messagesList: {
    paddingVertical: 10,
  },
  messageItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  messageLeft: {
    position: 'relative',
    marginRight: 12,
  },
  storeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.light,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  messageBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray,
  },
  unreadMessage: {
    color: COLORS.secondary,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
  },
});

export default InboxScreen;
