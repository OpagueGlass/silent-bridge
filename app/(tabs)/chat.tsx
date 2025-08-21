"use client";

import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Card, TextInput, IconButton } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

export default function ChatScreen() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");

  // Mock chat data
  const chats = [
    {
      id: 1,
      name: "John Smith",
      lastMessage: "Thank you for the session today!",
      time: "10:30",
      avatar: "/placeholder.svg?height=50&width=50",
      unread: 2,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      lastMessage: "Looking forward to our appointment",
      time: "09:15",
      avatar: "/placeholder.svg?height=50&width=50",
      unread: 0,
    },
    {
      id: 3,
      name: "Mike Chen",
      lastMessage: "Can we reschedule for tomorrow?",
      time: "Yesterday",
      avatar: "/placeholder.svg?height=50&width=50",
      unread: 1,
    },
  ];

  // Mock messages for selected chat
  const messages = [
    {
      id: 1,
      text: "Hi! I have a question about our upcoming appointment.",
      sender: "other",
      time: "10:25",
    },
    {
      id: 2,
      text: "Of course! What would you like to know?",
      sender: "me",
      time: "10:26",
    },
    {
      id: 3,
      text: "What should I prepare for the medical interpretation session?",
      sender: "other",
      time: "10:27",
    },
    {
      id: 4,
      text: "Please bring any medical documents and a list of questions you want to ask the doctor.",
      sender: "me",
      time: "10:28",
    },
  ];

  const sendMessage = () => {
    if (message.trim()) {
      // Add message sending logic here
      setMessage("");
    }
  };

  if (selectedChat) {
    const chat = chats.find((c) => c.id === selectedChat);

    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Image source={{ uri: chat.avatar }} style={styles.headerAvatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{chat.name}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>

        <ScrollView style={styles.messagesContainer}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.messageContainer, msg.sender === "me" ? styles.myMessage : styles.otherMessage]}
            >
              <View style={[styles.messageBubble, msg.sender === "me" ? styles.myBubble : styles.otherBubble]}>
                <Text
                  style={[styles.messageText, msg.sender === "me" ? styles.myMessageText : styles.otherMessageText]}
                >
                  {msg.text}
                </Text>
                <Text
                  style={[styles.messageTime, msg.sender === "me" ? styles.myMessageTime : styles.otherMessageTime]}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            style={styles.messageInput}
            mode="outlined"
            multiline
            right={
              <TextInput.Icon
                icon="attachment"
                onPress={() => {
                  /* Handle attachment */
                }}
              />
            }
          />
          <IconButton icon="send" mode="contained" onPress={sendMessage} style={styles.sendButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
      </View>

      <ScrollView style={styles.chatsList}>
        {chats.map((chat) => (
          <TouchableOpacity key={chat.id} onPress={() => setSelectedChat(chat.id)}>
            <Card style={styles.chatCard}>
              <Card.Content style={styles.chatContent}>
                <Image source={{ uri: chat.avatar }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    <Text style={styles.chatTime}>{chat.time}</Text>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                </View>
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#2196F3",
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  chatsList: {
    flex: 1,
  },
  chatCard: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  chatContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatTime: {
    fontSize: 12,
    color: "#666",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  unreadBadge: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  unreadText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 15,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 15,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerStatus: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
  },
  myMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
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
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: "#ffffff",
  },
  otherMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
  },
  myMessageTime: {
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "right",
  },
  otherMessageTime: {
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#ffffff",
    alignItems: "flex-end",
  },
  messageInput: {
    flex: 1,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#2196F3",
  },
});
