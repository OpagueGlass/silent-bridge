"use client"

import { useRouter } from "expo-router"
import React from "react"
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native"
import { Button, Card, List, Switch } from "react-native-paper"
import { useAuth } from "../../contexts/AuthContext"

export default function SettingsScreen() {
  const { userProfile, signOut } = useAuth()
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [emailNotifications, setEmailNotifications] = React.useState(true)

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to sign out?")) {
        await signOut()
        router.replace("/auth")
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut()
            router.replace("/auth")
          },
        },
      ])
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Card style={styles.profileCard}>
          <Card.Content>
            <Text style={styles.profileName}>{userProfile?.name}</Text>
            <Text style={styles.profileEmail}>{userProfile?.email}</Text>
            <Text style={styles.profileType}>
              {userProfile?.userType === "interpreter" ? "Interpreter" : "Deaf User"}
            </Text>
            <Button
              mode="outlined"
              style={styles.editProfileButton}
              onPress={() => {
                /* Navigate to profile edit */
              }}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.settingsCard}>
          <List.Item
            title="Push Notifications"
            description="Receive notifications for appointments and messages"
            right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
          />
          <List.Item
            title="Email Notifications"
            description="Receive email updates about your account"
            right={() => <Switch value={emailNotifications} onValueChange={setEmailNotifications} />}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.settingsCard}>
          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {
              /* Navigate to privacy policy */
            }}
          />
          <List.Item
            title="Terms of Service"
            description="Read our terms of service"
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {
              /* Navigate to terms */
            }}
          />
          <List.Item
            title="Help & Support"
            description="Get help with using the app"
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {
              /* Navigate to help */
            }}
          />
        </Card>
      </View>

      {userProfile?.userType === "interpreter" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interpreter Settings</Text>
          <Card style={styles.settingsCard}>
            <List.Item
              title="Availability"
              description="Manage your available hours"
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                /* Navigate to availability settings */
              }}
            />
            <List.Item
              title="Specializations"
              description="Update your areas of expertise"
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                /* Navigate to specializations */
              }}
            />
            <List.Item
              title="Pricing"
              description="Set your hourly rates"
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                /* Navigate to pricing */
              }}
            />
          </Card>
        </View>
      )}

      <View style={styles.section}>
        <Button mode="contained" onPress={handleSignOut} style={styles.signOutButton} buttonColor="#F44336">
          Sign Out
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  profileCard: {
    backgroundColor: "#ffffff",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  profileType: {
    fontSize: 14,
    color: "#2196F3",
    marginBottom: 15,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  editProfileButton: {
    marginTop: 10,
  },
  settingsCard: {
    backgroundColor: "#ffffff",
  },
  signOutButton: {
    paddingVertical: 8,
  },
  versionText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
})
