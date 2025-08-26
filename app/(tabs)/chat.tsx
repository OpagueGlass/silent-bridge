"use client";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { RealtimeChannel } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  Card,
  TextInput,
  IconButton,
  Appbar,
  Avatar,
} from "react-native-paper";

// 为我们的数据定义清晰的类型
interface ChatUser {
  id: string;
  name: string;
  photo: string;
}

interface ChatListItem {
  room_id: string;
  other_user: ChatUser;
  last_message?: string; // 暂时可选
  unread_count?: number; // 暂时可选
}

interface Message {
  id: number;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 1. 获取用户的聊天列表
  useEffect(() => {
    const fetchUserChats = async () => {
      if (!profile) return;
      setLoading(true);
      const { data, error } = await supabase.rpc("get_user_chats");

      if (error) {
        console.error("Error fetching user chats:", error);
      } else {
        setChats(data || []);
      }
      setLoading(false);
    };

    fetchUserChats();
  }, [profile]);

  // 2. 当用户选择一个聊天时，获取历史消息并设置实时订阅
  useEffect(() => {
    const fetchMessagesAndSubscribe = async () => {
      if (!selectedChat) return;

      // 获取历史消息
      const { data: initialMessages, error: messagesError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", selectedChat.room_id)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
      } else {
        setMessages(initialMessages || []);
      }

      // **关键部分：设置实时订阅**
      const channel = supabase
        .channel(`chat_room:${selectedChat.room_id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `room_id=eq.${selectedChat.room_id}`,
          },
          (payload) => {
            // 当收到新消息时，将其添加到消息列表的末尾
            setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
          }
        )
        .subscribe();
      
      channelRef.current = channel;
    };
    
    fetchMessagesAndSubscribe();

    // 组件卸载或选择新聊天时，取消上一个订阅，防止内存泄漏
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedChat]);

  // 3. 发送新消息的函数
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !profile || !selectedChat) return;

    const messageToSend = {
      room_id: selectedChat.room_id,
      sender_id: profile.id,
      content: newMessage,
    };

    const { error } = await supabase.from("chat_messages").insert(messageToSend);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage(""); // 发送成功后清空输入框
    }
  };

  // --- 界面渲染部分 ---

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 如果选择了某个聊天，则显示消息界面
  if (selectedChat) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => setSelectedChat(null)} />
          <Avatar.Image size={40} source={{ uri: selectedChat.other_user.photo }} style={styles.headerAvatar} />
          <Appbar.Content title={selectedChat.other_user.name} subtitle="Online" />
        </Appbar.Header>

        <ScrollView contentContainerStyle={styles.messagesContainer}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.sender_id === profile?.id ? styles.myMessage : styles.otherMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.sender_id === profile?.id ? styles.myBubble : styles.otherBubble,
                ]}
              >
                <Text style={msg.sender_id === profile?.id ? styles.myMessageText : styles.otherMessageText}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            mode="outlined"
            multiline
          />
          <IconButton
            icon="send"
            size={24}
            onPress={handleSendMessage}
            style={styles.sendButton}
            iconColor="#ffffff"
          />
        </View>
      </View>
    );
  }

  // 默认显示聊天列表
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Chats" />
      </Appbar.Header>
      <ScrollView style={styles.chatsList}>
        {chats.map((chat) => (
          <TouchableOpacity key={chat.room_id} onPress={() => setSelectedChat(chat)}>
            <Card style={styles.chatCard}>
              <Card.Title
                title={chat.other_user.name}
                subtitle={chat.last_message || "No messages yet"}
                left={(props) => <Avatar.Image {...props} source={{ uri: chat.other_user.photo }} />}
                right={(props) => (chat.unread_count || 0) > 0 && <Text {...props}>{chat.unread_count}</Text>}
              />
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// --- 样式部分 ---

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatsList: {
        flex: 1,
    },
    chatCard: {
        marginHorizontal: 10,
        marginVertical: 5,
    },
    headerAvatar: {
        marginLeft: -8,
        marginRight: 8,
    },
    messagesContainer: {
        flexGrow: 1,
        padding: 15,
    },
    messageContainer: {
        marginBottom: 15,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
        alignItems: "flex-end",
    },
    otherMessage: {
        alignSelf: 'flex-start',
        alignItems: "flex-start",
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
    },
    myBubble: {
        backgroundColor: "#2196F3",
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: "#ffffff",
        borderBottomLeftRadius: 4,
        elevation: 1,
    },
    myMessageText: {
        color: "#ffffff",
        fontSize: 16,
    },
    otherMessageText: {
        color: "#333",
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        alignItems: "center",
    },
    messageInput: {
        flex: 1,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: "#2196F3",
        margin: 0,
    },
});
