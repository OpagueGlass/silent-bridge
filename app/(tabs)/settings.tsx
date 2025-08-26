// app/(tabs)/settings.tsx

"use client";

import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, List, Switch } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { showConfirmAlert, showError } from "../../utils/alert";
import { useAppTheme } from "../../hooks/useAppTheme";
import { getMeetLink } from "../../utils/helper"; // 导入我们创建的函数

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // 从 AuthContext 获取所需的一切，包括 providerToken
  const { profile, isInterpreter, signOut, providerToken } = useAuth();
  
  const [isTesting, setIsTesting] = useState(false);
  const theme = useAppTheme();

  const handleSignOut = async () => {
    const confirmed = await showConfirmAlert("Sign Out", "Are you sure you want to sign out?");
    if (confirmed) {
      await signOut();
      router.replace("/auth");
    }
  };

  // --- 新增的测试函数 ---
  const handleTestMeetLink = async () => {
    if (!providerToken) {
      showError("Provider token is not available. Please sign in again with Google.");
      return;
    }
    
    setIsTesting(true);
    try {
      // 调用 helper 中的函数
      await getMeetLink(providerToken);
    } catch (error: any) {
      showError(error.message || "Failed to generate Google Meet link.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Card style={styles.profileCard}>
          <Card.Title
            title={profile?.name || "User"}
            subtitle={profile?.email || "No email"}
            left={(props) => <List.Icon {...props} icon="account-circle" />}
          />
          <Card.Content>
            <Text style={styles.profileType}>
              {isInterpreter ? "Interpreter" : "Deaf User"}
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => { /* Navigate to profile edit */ }}>
              Edit Profile
            </Button>
          </Card.Actions>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.settingsCard}>
          <List.Item
            title="Push Notifications"
            right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
          />
          <List.Item
            title="Email Notifications"
            right={() => <Switch value={emailNotifications} onValueChange={setEmailNotifications} />}
          />
        </Card>
      </View>
      
      {/* --- 新增的测试部分 --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer Tools</Text>
        <Card style={styles.settingsCard}>
          <List.Item
            title="Test Google API"
            description="Generates a Google Meet link using your token"
          />
          <Card.Actions>
            <Button 
              onPress={handleTestMeetLink} 
              loading={isTesting} 
              disabled={isTesting}
            >
              Test Google Meet Link
            </Button>
          </Card.Actions>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.settingsCard}>
          <List.Item title="Privacy Policy" onPress={() => {}} right={(props) => <List.Icon {...props} icon="chevron-right" />} />
          <List.Item title="Terms of Service" onPress={() => {}} right={(props) => <List.Icon {...props} icon="chevron-right" />} />
          <List.Item title="Help & Support" onPress={() => {}} right={(props) => <List.Icon {...props} icon="chevron-right" />} />
        </Card>
      </View>

      {isInterpreter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interpreter Settings</Text>
          <Card style={styles.settingsCard}>
            <List.Item title="My Availability" onPress={() => {}} right={(props) => <List.Icon {...props} icon="chevron-right" />} />
            <List.Item title="My Specializations" onPress={() => {}} right={(props) => <List.Icon {...props} icon="chevron-right" />} />
            <List.Item title="Pricing & Payouts" onPress={() => {}} right={(props) => <List.Icon {...props} icon="chevron-right" />} />
          </Card>
        </View>
      )}

      <View style={styles.section}>
        <Button
          mode="contained"
          onPress={handleSignOut}
          style={styles.signOutButton}
          buttonColor={theme.colors.error}
        >
          Sign Out
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  profileType: {
    fontSize: 14,
    color: "#2196F3",
    textTransform: "uppercase",
    fontWeight: "bold",
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
    marginTop: 10,
    paddingBottom: 20,
  },
});
