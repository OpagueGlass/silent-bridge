"use client"

import React, { useState, useRef, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  KeyboardAvoidingView,
  Platform,
  BackHandler
} from "react-native"
import { Card, TextInput, IconButton } from "react-native-paper"
import { MaterialIcons } from "@expo/vector-icons"
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native"
import { createStackNavigator, StackNavigationProp } from "@react-navigation/stack"
import { RouteProp } from "@react-navigation/native"

// 定义导航参数类型
type RootStackParamList = {
  ChatList: undefined
  ChatDetail: { chatId: number; chatName: string; chatAvatar: string }
}

type ChatListNavigationProp = StackNavigationProp<RootStackParamList, 'ChatList'>
type ChatDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ChatDetail'>
type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>

type Message = {
  id: number
  text: string
  sender: "me" | "other"
  time: string
}

const Stack = createStackNavigator<RootStackParamList>()

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
]

// 初始消息数据
const initialMessages: Record<number, Message[]> = {
  1: [
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
  ],
  2: [
    {
      id: 1,
      text: "Hello! Looking forward to our appointment.",
      sender: "other",
      time: "09:15",
    },
  ],
  3: [
    {
      id: 1,
      text: "Can we reschedule for tomorrow?",
      sender: "other",
      time: "Yesterday",
    },
  ],
}

// 聊天列表组件
function ChatListScreen() {
  const navigation = useNavigation<ChatListNavigationProp>()
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
      </View>

      <ScrollView style={styles.chatsList}>
        {chats.map((chat) => (
          <TouchableOpacity 
            key={chat.id} 
            onPress={() => 
              navigation.navigate('ChatDetail', {
                chatId: chat.id,
                chatName: chat.name,
                chatAvatar: chat.avatar
              })
            }
          >
            <Card style={styles.chatCard}>
              <Card.Content style={styles.chatContent}>
                <Image source={{ uri: chat.avatar }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                  <View style={styles.chatListHeader}>
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
  )
}

// 聊天详情组件
function ChatDetailScreen() {
  const navigation = useNavigation<ChatDetailNavigationProp>()
  const route = useRoute<ChatDetailRouteProp>()
  const { chatId, chatName, chatAvatar } = route.params
  
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const scrollViewRef = useRef<ScrollView>(null)

  // 获取当前时间
  const getCurrentTime = () => {
    const now = new Date()
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
  }

  // 滚动到底部的函数
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  // 发送消息功能
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: message.trim(),
        sender: "me",
        time: getCurrentTime(),
      }
      
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, newMessage]
        scrollToBottom()
        return newMessages
      })
      
      setMessage("")
    }
  }

  // 组件挂载时加载消息
  useEffect(() => {
    setMessages(initialMessages[chatId] || [])
    setTimeout(() => scrollToBottom(), 200)
  }, [chatId])

  // 处理 Android 返回键
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack()
        return true
      }

      if (Platform.OS === 'android') {
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)
        return () => subscription?.remove()
      }
    }, [navigation])
  )

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollToBottom()}
      >
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
          maxLength={1000}
          onFocus={() => {
            setTimeout(() => scrollToBottom(), 300)
          }}
          right={
            <TextInput.Icon
              icon="attachment"
              onPress={() => {
                /* Handle attachment */
              }}
            />
          }
        />
        <IconButton 
          icon="send" 
          mode="contained" 
          onPress={sendMessage} 
          style={[
            styles.sendButton,
            { opacity: message.trim() ? 1 : 0.5 }
          ]}
          disabled={!message.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

// 主要的聊天组件
export default function ChatScreen() {
  return (
    <Stack.Navigator
      initialRouteName="ChatList"
      screenOptions={{
        headerShown: false, // 隐藏默认头部，使用自定义头部
        gestureEnabled: true, // 启用手势
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }
        },
      }}
    >
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{
          title: 'Chat'
        }}
      />
      <Stack.Screen 
        name="ChatDetail" 
        component={ChatDetailScreen}
        options={({ route }) => ({
          title: route.params.chatName,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: ({ onPress }) => (
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={onPress}
            >
              <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
          headerTitle: ({ children }) => (
            <View style={styles.headerTitleContainer}>
              <Image 
                source={{ uri: route.params.chatAvatar }} 
                style={styles.headerTitleAvatar} 
              />
              <View>
                <Text style={styles.headerTitleText}>{children}</Text>
                <Text style={styles.headerSubtitle}>Online</Text>
              </View>
            </View>
          ),
          // iOS 侧滑返回配置
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        })}
      />
    </Stack.Navigator>
  )
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
  chatListHeader: {
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
  headerBackButton: {
    marginLeft: 15,
    padding: 5,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTitleAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 12,
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
})
