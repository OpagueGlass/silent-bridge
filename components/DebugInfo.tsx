// components/DebugInfo.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function DebugInfo() {
  const { userProfile, user } = useAuth();

  if (!__DEV__) return null; // 只在开发模式显示

  return (
    <Card style={styles.debugCard}>
      <Card.Content>
        <Text variant="titleSmall" style={styles.debugTitle}>Debug Info</Text>
        <Text variant="bodySmall">User: {user?.email || 'Not logged in'}</Text>
        <Text variant="bodySmall">Profile: {userProfile?.name || 'No profile'}</Text>
        <Text variant="bodySmall">UID: {user?.uid || 'N/A'}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  debugCard: {
    margin: 16,
    backgroundColor: '#f5f5f5',
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
