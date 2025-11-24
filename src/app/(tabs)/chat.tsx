'use client';

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase'; // Adjust path if needed
import { useAuth } from '@/contexts/AuthContext'; // Adjust path if needed
import { useAppTheme } from '@/hooks/useAppTheme'; // Adjust path if needed

/**
 * Represents the structure of a single chat conversation for the list.
 */
interface Chat {
  room_id: string;
  other_user: {
    id: string;
    name: string;
    photo: string;
  };
}

/**
 * Screen that displays a list of all chat conversations for the logged-in user.
 */
export default function ChatListScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { session } = useAuth();
  const user = session?.user;
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    /**
     * Fetches the list of chat rooms from the database using the
     * 'get_user_chats' remote procedure call.
     * It includes type guarding to ensure the data matches the 'Chat' interface.
     */
    const fetchChats = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_chats');

      if (error) {
        console.error('Error fetching chats:', error);
        setChats([]); // Ensure state is an empty array on error
      } else if (data && Array.isArray(data)) {
        // FIX: Perform a type guard and data transformation.
        // This ensures that every item in the array has the expected structure
        // before we try to set it in the state.
        const validChats = data
          .map((item: any) => {
            // Check if 'other_user' and its properties exist and are of the correct type.
            if (
              item &&
              typeof item.room_id === 'string' &&
              item.other_user &&
              typeof item.other_user.id === 'string' &&
              typeof item.other_user.name === 'string' &&
              typeof item.other_user.photo === 'string'
            ) {
              // If valid, return the object cast to the correct type.
              return item as Chat;
            }
            // If invalid, return null.
            return null;
          })
          // Filter out any null entries that resulted from invalid data.
          .filter((item): item is Chat => item !== null);
        
        setChats(validChats);
      } else {
        // Handle cases where data is null or not an array.
        setChats([]);
      }
      setLoading(false);
    };

    fetchChats();
  }, [user]);

  // ... (The rest of the component's JSX and styles remain the same)
  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;
  }

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.room_id } })}>
      <Card style={styles.chatCard}>
        <Card.Title
          title={item.other_user.name}
          titleStyle={{ color: theme.colors.onSurface }}
          left={(props) => <Image {...props} source={{ uri: item.other_user.photo }} style={styles.avatar} />}
        />
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.onSurface }]}>Conversations</Text>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.room_id}
        ListEmptyComponent={<Text style={styles.emptyText}>No conversations yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chatCard: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  }
});
