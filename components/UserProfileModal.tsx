// components/UserProfileModal.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Card, MD3Theme } from 'react-native-paper';
import { useAppTheme } from '../hooks/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { requests } from '../app/data/mockDataDeaf';
import { Profile } from '@/utils/query';

// Component Props
interface UserProfileModalProps {
  visible: boolean;
  profile: Profile | null;
  onClose: () => void;
}

export default function UserProfileModal({ visible, profile, onClose }: UserProfileModalProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!profile) {
    return null; // Do not render if user not found
  }

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>User Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="hand-wave" size={40} style={styles.avatarIcon} />
              </View>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.userType}>Deaf Community Member</Text>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={20} color="#FBBF24" />
                <Text style={styles.ratingText}>{profile.avgRating}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              <Card style={styles.sessionCard}>
                <Card.Content>
                  <Text style={styles.sessionTitle}>Medical Consultation</Text>
                  <Text style={styles.sessionDate}>March 10, 2024</Text>
                </Card.Content>
              </Card>
              <Card style={styles.sessionCard}>
                <Card.Content>
                  <Text style={styles.sessionTitle}>Medical Consultation</Text>
                  <Text style={styles.sessionDate}>March 5, 2024</Text>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>
                  "{profile.name.split(' ')[0]} is a returning patient who previously had a successful surgery. His family is very concerned about his recovery and tends to ask many detailed questions."
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]}
              onPress={onClose} >
                <Text style={styles.buttonTextSecondary}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonPrimary]}>
                <Text style={styles.buttonTextPrimary}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { height: '85%', backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface },
  content: { padding: 20 },
  profileInfo: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: theme.colors.primaryContainer, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarIcon: { color: theme.colors.primary },
  name: { fontSize: 22, fontWeight: 'bold', color: theme.colors.onSurface },
  userType: { fontSize: 16, color: theme.colors.onSurfaceVariant, marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 8, color: theme.colors.onSurfaceVariant },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 12 },
  sessionCard: { marginBottom: 12 },
  sessionTitle: { fontSize: 16, fontWeight: '500', color: theme.colors.onSurface },
  sessionDate: { fontSize: 14, color: theme.colors.onSurfaceVariant },
  notesCard: { padding: 16, backgroundColor: theme.colors.surfaceVariant, borderRadius: 12 },
  notesText: { color: theme.colors.onSurfaceVariant, lineHeight: 22 },
  buttonContainer: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 30, alignItems: 'center' },
  buttonPrimary: { backgroundColor: theme.colors.primary },
  buttonSecondary: { backgroundColor: theme.colors.secondaryContainer },
  buttonTextPrimary: { color: theme.colors.onPrimary, fontWeight: 'bold' },
  buttonTextSecondary: { color: theme.colors.onSecondaryContainer, fontWeight: 'bold' },
});