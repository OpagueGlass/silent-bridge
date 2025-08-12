import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { interpreters } from '../../data/mockData';
import { Button, Card, TextInput, MD3Theme } from 'react-native-paper';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookingScreen() {
  const router = useRouter();

  const { id, date, time } = useLocalSearchParams();
  const interpreter = interpreters.find((item) => item.id.toString() === id);

  const theme = useAppTheme();
  const styles = createStyles(theme);

  const [notes, setNotes] = React.useState("");

  // Defensive programming
  if (!interpreter) {
    return <Text>Interpreter not found.</Text>;
  }

  const initials = interpreter.name.split(" ").map(word => word[0]).slice(0, 2).join("");
  const fullStars = Math.floor(interpreter.rating);

  return (
  <ScrollView style={styles.screen}>

  <Stack.Screen options={{ headerShown: false }} />

    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Confirm Booking</Text>
    </View>
    
    <View style={styles.contentContainer}>

      {/* --- Session Details Card --- */}
      <View style={styles.sessionCard}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        <View style={styles.interpreterRow}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <View style={styles.interpreterInfo}>
            <Text style={styles.interpreterName}>{interpreter.name}</Text>
            <Text style={styles.interpreterSubtitle}>{interpreter.specialisation}</Text>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <MaterialCommunityIcons 
                  key={i} 
                  name={i < fullStars ? "star" : "star-outline"}
                  size={16} 
                  color="#FBBF24" 
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar-blank" size={20} style={styles.infoIcon} />
          <Text style={styles.infoText}>{date}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-outline" size={20} style={styles.infoIcon} />
          <Text style={styles.infoText}>{time} (1 hour)</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="video-outline" size={20} style={styles.infoIcon} />
          <Text style={styles.infoText}>Video Call Session</Text>
        </View>
      </View>

      {/* --- Notes Section --- */}
      <Text style={styles.sectionTitle}>Notes for Interpreter (Optional)</Text>
      <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any specific details about your session..."
          multiline={true}
          style={styles.notesInput}
      />

      {/* --- Info Callouts --- */}
      <View style={[styles.calloutCard, styles.calloutBlue, { marginTop: 24 }]}>
          <MaterialCommunityIcons name="email-lock" size={24} style={[styles.calloutIcon, { color: '#2563EB' }]} />
          <View style={styles.calloutTextContainer}>
              <Text style={[styles.calloutTitle, { color: '#1E40AF' }]}>Secure In-App Messaging</Text>
              <Text style={{ color: '#1D4ED8' }}>All communication happens safely within the app.</Text>
          </View>
      </View>

      <View style={[styles.calloutCard, styles.calloutGreen]}>
          <MaterialCommunityIcons name="check-circle" size={24} style={[styles.calloutIcon, { color: '#059669' }]} />
          <View style={styles.calloutTextContainer}>
              <Text style={[styles.calloutTitle, { color: '#065F46' }]}>Free Service</Text>
              <Text style={{ color: '#047857' }}>This interpretation session is provided at no cost.</Text>
          </View>
      </View>

      {/* --- Action Buttons --- */}
      <TouchableOpacity 
        style={[styles.button, styles.buttonPrimary, { marginTop: 24 }]}
        onPress={() => router.push({
          pathname: "/interpreter/[id]/booking-success",
          params: { id: interpreter.id, date, time } 
        })}
      >
        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Confirm & Book Session</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
      </TouchableOpacity>
      
    </View>
  </ScrollView>
  );
}

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB"
  },
  backButton: {
    marginRight: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937"
  },
  contentContainer: {
    padding: 24
  },
  sessionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16
  },
  interpreterRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold"
  },
  interpreterInfo: {
    flex: 1
  },
  interpreterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937"
  },
  interpreterSubtitle: {
    color: "#6B7280",
    fontSize: 14
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: 4
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  infoIcon: {
    marginRight: 12,
    color: "#9CA3AF"
  },
  infoText: {
    color: "#374151",
    fontSize: 16
  },
  notesInput: {
    backgroundColor: "white",
    height: 96,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    textAlignVertical: "top"
  },
  calloutCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center"
  },
  calloutBlue: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1
  },
  calloutGreen: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1
  },
  calloutIcon: {
    marginRight: 12
  },
  calloutTextContainer: {
    flex: 1
  },
  calloutTitle: {
    fontWeight: "600"
  },
  calloutBody: {
    fontSize: 14
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 12
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600"
  },
  buttonTextPrimary: {
    color: theme.colors.onPrimary
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "500",
    textAlign: "center"
  }
});
