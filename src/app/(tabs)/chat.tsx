"use client";
import Gradient from "@/components/ui/Gradient";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getUserChats, Profile } from "@/utils/query";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Searchbar, Text } from "react-native-paper";

/**
 * Represents the structure of a single chat conversation for the list.
 */
interface Chat {
  room_id: string;
  profile: Profile;
}
const ChatCard = ({ chat, onPress, theme }: { chat: Chat; onPress: (room_id: string) => void; theme: any }) => (
  <TouchableOpacity onPress={() => onPress(chat.room_id)} style={{}}>
    <Card style={styles.chatCard}>
      <View style={styles.cardInfo}>
        <Image source={{ uri: chat.profile.photo }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>{chat.profile.name}</Text>
          <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>{chat.profile.email}</Text>
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

/**
 * Screen that displays a list of all chat conversations for the logged-in user.
 */
export default function ChatListScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { profile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");

  const fetchChats = useCallback(async () => {
    if (profile) {
      const data = await getUserChats(profile.id);
      setChats(data);
    }
  }, [profile]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const filteredChats = chats.filter(
    (chat) =>
      chat.profile.name.toLowerCase().includes(search.toLowerCase()) ||
      chat.profile.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleChatPress = (room_id: string) => {
    router.push(`/chat/${room_id}`);
  };

  return (
    <View style={[{ flex: 1, backgroundColor: theme.colors.elevation.level2 }]}>
      <Gradient style={styles.header}>
        <Searchbar placeholder="Search chats..." value={search} onChangeText={setSearch} style={styles.searchbar} />
      </Gradient>
      <View style={styles.listContentContainer}>
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.room_id}
          renderItem={({ item }) => <ChatCard onPress={handleChatPress} chat={item} theme={theme} />}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No conversations yet.</Text>}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  searchbar: {
    borderRadius: 12,
  },
  listContentContainer: {
    flex: 1,
    alignItems: "center",
  },
  chatCard: {
    width: "100%",
    maxWidth: 500,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
  },
});
