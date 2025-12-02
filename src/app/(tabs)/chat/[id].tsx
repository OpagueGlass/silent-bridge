'use client';

import LoadingScreen from '@/components/sections/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { getOtherParticipant } from '@/utils/query';
import { supabase } from '@/utils/supabase';
import { getAgeRangeFromDOB } from '@/utils/time';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MsgKind = 'text' | 'image' | 'file';

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
  type: MsgKind;
  file_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  gender: string;
  location: string;
  photo: string;
  avgRating: number | null;
  ageRange: any;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export default function ChatRoomScreen() {
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const user = session?.user;
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 签名URL缓存（路径 -> URL）
  const signedUrlCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!roomId || !user) return;

      try {
        // 通过 RPC 获取另一位参与者
        const otherId = await getOtherParticipant(String(roomId));
        if (!otherId) {
          console.error('No other participant resolved for room:', roomId);
          setLoading(false);
          return;
        }

        // 拉取对方 profile
        const { data: otherUserData, error: uError } = await supabase
          .from('profile')
          .select('*')
          .eq('id', otherId)
          .single();
        if (uError) throw uError;

        const profileForState: Profile = {
          id: otherUserData.id,
          name: otherUserData.name,
          email: otherUserData.email,
          gender: otherUserData.gender,
          location: otherUserData.location,
          photo: otherUserData.photo,
          avgRating: otherUserData.avg_rating,
          ageRange: getAgeRangeFromDOB(otherUserData.date_of_birth),
        };
        setOtherUser(profileForState);

        // 拉取历史消息
        const { data: messageData, error: mError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });
        if (mError) throw mError;
        setMessages((messageData as Message[]) || []);
      } catch (e) {
        console.error('Failed to load chat room:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [roomId, user]);

  // 实时订阅新消息（对方发的），依旧忽略自己发的以避免与本地追加重复
  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase
      .channel(`room_${roomId}`)
      .on<Message>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if ((payload.new as any).sender_id !== user.id) {
            setMessages((curr) => [...curr, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  // 发送文本消息（乐观追加）
  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !user || !roomId) return;

    const messageContent = newMessage.trim();
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      room_id: String(roomId),
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      type: 'text',
      file_path: null,
      file_name: null,
      mime_type: null,
      file_size: null,
      width: null,
      height: null,
    };

    setMessages((curr) => [...curr, optimistic]);
    setNewMessage('');

    const { error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: user.id,
      content: messageContent,
      type: 'text',
    });
    if (error) {
      console.error('Error sending message:', error);
      setMessages((curr) => curr.filter((m) => m.id !== optimistic.id));
      setNewMessage(messageContent);
    }
  };

  // 选择图片并发送
  const pickImageAndSend = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    await uploadAndSendAttachment({
      uri: asset.uri,
      fileName: asset.fileName ?? 'image.jpg',
      mimeType: asset.mimeType ?? 'image/jpeg',
      kind: 'image',
      width: asset.width,
      height: asset.height,
    });
  };

  // 选择文件并发送
  const pickDocumentAndSend = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (result.canceled) return;

    const asset = result.assets[0];
    await uploadAndSendAttachment({
      uri: asset.uri,
      fileName: asset.name ?? 'file',
      mimeType: asset.mimeType ?? 'application/octet-stream',
      kind: 'file',
      size: asset.size,
    });
  };

  // 上传并写入附件消息（插入后 .select('*').single() 立刻取回并追加）
  const uploadAndSendAttachment = async (f: {
    uri: string;
    fileName: string;
    mimeType: string;
    kind: MsgKind; // 'image' | 'file'
    width?: number;
    height?: number;
    size?: number;
  }) => {
    if (!roomId || !user) return;
    try {
      setUploading(true);

      // 读取为 Blob
      const res = await fetch(f.uri);
      const blob = await res.blob();

      // 固定路径：rooms/<roomId>/<uuid>-<fileName>
      const path = `rooms/${roomId}/${crypto.randomUUID()}-${f.fileName}`;

      // 上传到私有桶 chat-attachments
      const { error: upErr } = await supabase.storage
        .from('chat-attachments')
        .upload(path, blob, { contentType: f.mimeType });
      if (upErr) throw upErr;

      // 写入消息记录并立刻取回该新行
      const { data: inserted, error: insErr } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          type: f.kind,
          content: '', // 附件消息文本为空
          file_path: path,
          file_name: f.fileName,
          mime_type: f.mimeType,
          file_size: typeof f.size === 'number' ? f.size : (blob as any).size ?? null,
          width: f.width ?? null,
          height: f.height ?? null,
        })
        .select('*')
        .single();
      if (insErr) throw insErr;

      if (inserted) {
        setMessages((curr) => [...curr, inserted as Message]);
      }
    } catch (e) {
      console.error('Upload/send failed:', e);
    } finally {
      setUploading(false);
    }
  };

  // 生成签名URL（带缓存与轻量重试）
  const getSignedUrl = useCallback(
    async (filePath: string, kind: MsgKind): Promise<string | null> => {
      if (!filePath) return null;

      const cached = signedUrlCache.current.get(filePath);
      if (cached) return cached;

      const attempts = 3; // 最多尝试3次
      let lastError: any = null;

      for (let i = 0; i < attempts; i++) {
        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .createSignedUrl(filePath, 60, {
            transform: kind === 'image' ? { width: 1200, height: 1200 } : undefined,
            download: kind === 'file' ? true : undefined,
          });

        if (!error && data?.signedUrl) {
          signedUrlCache.current.set(filePath, data.signedUrl);
          return data.signedUrl;
        }

        lastError = error;
        // 退避等待，再试
        await new Promise((r) => setTimeout(r, 400 + i * 400));
      }

      console.error('createSignedUrl error after retries:', lastError);
      return null;
    },
    []
  );

  // 渲染单条消息（文本、图片、文件）
  const renderItem = useCallback(
    ({ item }: { item: Message }) => {
      const isSender = item.sender_id === user?.id;

      if (item.type === 'text' || !item.file_path) {
        return (
          <View style={[styles.messageRow, isSender ? styles.rowSender : styles.rowReceiver]}>
            {!isSender && <View style={styles.avatarSpacer} />}
            <View
              style={[
                styles.messageBubble,
                isSender ? styles.senderBubble : styles.receiverBubble,
                { backgroundColor: isSender ? theme.colors.primaryContainer : theme.colors.surfaceVariant },
              ]}
            >
              <Text style={{ color: isSender ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }}>
                {item.content ?? ''}
              </Text>
              <Text style={[styles.timestamp, { color: isSender ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          </View>
        );
      }

      // 附件消息：图片或文件
      return (
        <AttachmentBubble
          item={item}
          isSender={isSender}
          themeColors={{
            bg: isSender ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
            fg: isSender ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
          }}
          getSignedUrl={getSignedUrl}
        />
      );
    },
    [theme.colors, user, getSignedUrl]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {/* 头部 */}
      <View style={[styles.header, { backgroundColor: theme.colors.elevation.level2 }]}>
        <TouchableOpacity
          onPress={() => {
            // 统一回到聊天列表，避免回到 Home
            router.replace('/chat');
          }}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        {otherUser?.photo ? <Image source={{ uri: otherUser.photo }} style={styles.headerAvatar} /> : null}
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {otherUser?.name || 'Chat'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageListContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* 输入栏 */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10, backgroundColor: theme.colors.elevation.level1 }]}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={pickImageAndSend} disabled={uploading} style={styles.iconBtn}>
              <MaterialIcons name="image" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickDocumentAndSend} disabled={uploading} style={styles.iconBtn}>
              <MaterialIcons name="attach-file" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.textInput, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurfaceVariant }]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            multiline
          />

          <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.colors.primary }]} onPress={handleSendMessage} disabled={uploading}>
            <MaterialIcons name="send" size={24} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function AttachmentBubble({
  item,
  isSender,
  themeColors,
  getSignedUrl,
}: {
  item: Message;
  isSender: boolean;
  themeColors: { bg: string; fg: string };
  getSignedUrl: (path: string, kind: MsgKind) => Promise<string | null>;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (item.file_path) {
        const u = await getSignedUrl(item.file_path, item.type);
        if (mounted) setUrl(u);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [item.file_path, item.type, getSignedUrl]);

  if (item.type === 'image' && url) {
    return (
      <View style={[styles.messageRow, isSender ? styles.rowSender : styles.rowReceiver]}>
        {!isSender && <View style={styles.avatarSpacer} />}
        <View style={[styles.messageBubble, isSender ? styles.senderBubble : styles.receiverBubble, { backgroundColor: themeColors.bg }]}>
          <Image
            source={{ uri: url }}
            style={[
              styles.imagePreview,
              item.width && item.height
                ? { aspectRatio: Math.max(0.5, Math.min(2, item.width / item.height)) }
                : { aspectRatio: 1 },
            ]}
            resizeMode="cover"
          />
          <Text style={[styles.timestamp, { color: themeColors.fg }]}>{formatTime(item.created_at)}</Text>
        </View>
      </View>
    );
  }

  // 文件类型：显示文件名与大小，点击打开下载
  return (
    <View style={[styles.messageRow, isSender ? styles.rowSender : styles.rowReceiver]}>
      {!isSender && <View style={styles.avatarSpacer} />}
      <View style={[styles.messageBubble, isSender ? styles.senderBubble : styles.receiverBubble, { backgroundColor: themeColors.bg }]}>
        <View style={styles.fileRow}>
          <MaterialIcons name="insert-drive-file" size={20} color={themeColors.fg} />
          <Text style={[styles.fileName, { color: themeColors.fg }]} numberOfLines={1}>
            {item.file_name ?? 'file'}
          </Text>
          {typeof item.file_size === 'number' ? (
            <Text style={[styles.fileSize, { color: themeColors.fg }]}>{prettySize(item.file_size)}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          disabled={!url}
          onPress={() => {
            if (url) Linking.openURL(url);
          }}
          style={styles.openBtn}
        >
          <Text style={{ color: themeColors.fg }}>{url ? 'Open' : 'Preparing...'}</Text>
        </TouchableOpacity>
        <Text style={[styles.timestamp, { color: themeColors.fg }]}>{formatTime(item.created_at)}</Text>
      </View>
    </View>
  );
}

function prettySize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 5, marginRight: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  messageListContainer: { paddingHorizontal: 10, paddingTop: 10 },
  messageRow: { flexDirection: 'row', marginVertical: 4 },
  rowSender: { justifyContent: 'flex-end' },
  rowReceiver: { justifyContent: 'flex-start' },
  avatarSpacer: { width: 40, marginRight: 8 },
  messageBubble: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, maxWidth: '75%' },
  senderBubble: { borderBottomRightRadius: 5 },
  receiverBubble: { borderBottomLeftRadius: 5 },
  timestamp: { fontSize: 11, opacity: 0.8, alignSelf: 'flex-end', marginTop: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  leftActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6 },
  textInput: { flex: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100, marginHorizontal: 8 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  imagePreview: { width: 220, borderRadius: 8, backgroundColor: '#0001' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 220 },
  fileName: { flexShrink: 1 },
  fileSize: { marginLeft: 6, opacity: 0.9 },
  openBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
});
