"use client";

import EditInterpreterDetailsModal from "@/components/modals/EditInterpreterDetailsModal";
import EditProfileModal from "@/components/modals/EditProfileModal";
import WarningDialog from "@/components/modals/WarningDialog";
import Gradient from "@/components/ui/Gradient";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Divider, List, MD3Theme, Switch, Text } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { profile, isInterpreter, signOut } = useAuth();

  const { isOpen: isSignOutOpen, open: openSignOut, close: closeSignOut } = useDisclosure(false);
  const { isOpen: isEditProfileOpen, open: openEditProfile, close: closeEditProfile } = useDisclosure(false);
  const {
    isOpen: isEditInterpreterOpen,
    open: openEditInterpreter,
    close: closeEditInterpreter,
  } = useDisclosure(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    closeSignOut();
    router.replace("/auth");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.elevation.level1 }}>
      <ScrollView>
        {/* Profile Header */}
        <Gradient style={styles.header}>
          <Avatar.Image size={80} source={{ uri: profile?.photo || "https://via.placeholder.com/80" }} />
          <Text variant="headlineSmall" style={styles.profileName}>
            {profile?.name}
          </Text>
          <Text variant="bodyMedium" style={styles.profileEmail}>
            {profile?.email}
          </Text>
          <View style={styles.badge}>
            <Text variant="labelSmall" style={styles.badgeText}>
              {isInterpreter ? "Interpreter" : "Deaf User"}
            </Text>
          </View>
        </Gradient>

        <View style={styles.content}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              ACCOUNT
            </Text>
            <View style={styles.card}>
              <List.Item
                title="Edit Profile"
                description="Update your personal information"
                left={(props) => <List.Icon {...props} icon="account-edit" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={openEditProfile}
              />
            </View>
          </View>

          {/* Interpreter Settings */}
          {isInterpreter && (
            <View style={styles.section}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                INTERPRETER
              </Text>
              <View style={styles.card}>
                <List.Item
                  title="Specialisations & Languages"
                  description="Update areas of expertise and sign languages"
                  left={(props) => <List.Icon {...props} icon="certificate" />}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                  onPress={openEditInterpreter}
                />
                <Divider />
                <List.Item
                  title="Availability"
                  description="Manage your schedule"
                  left={(props) => <List.Icon {...props} icon="calendar-clock" />}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => router.push("/availability")}
                />
              </View>
            </View>
          )}

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              NOTIFICATIONS
            </Text>
            <View style={styles.card}>
              <List.Item
                title="Push Notifications"
                description="Appointment and message alerts"
                left={(props) => <List.Icon {...props} icon="bell" />}
                right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
              />
              <Divider />
              <List.Item
                title="Email Notifications"
                description="Receive updates via email"
                left={(props) => <List.Icon {...props} icon="email" />}
                right={() => <Switch value={emailNotifications} onValueChange={setEmailNotifications} />}
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              PREFERENCES
            </Text>
            <View style={styles.card}>
              <List.Item
                title="Dark Mode"
                description="Switch to dark theme"
                left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
                right={() => <Switch value={darkMode} onValueChange={setDarkMode} />}
              />
              <Divider />
              <List.Item
                title="Language"
                description="English (US)"
                left={(props) => <List.Icon {...props} icon="translate" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              SUPPORT
            </Text>
            <View style={styles.card}>
              <List.Item
                title="Help Center"
                description="Get help and support"
                left={(props) => <List.Icon {...props} icon="help-circle" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Privacy Policy"
                description="Read our privacy policy"
                left={(props) => <List.Icon {...props} icon="shield-account" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
              <Divider />
              <List.Item
                title="Terms of Service"
                description="Read our terms"
                left={(props) => <List.Icon {...props} icon="file-document" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {}}
              />
            </View>
          </View>

          {/* Sign Out */}
          <View style={styles.section}>
            <Button
              mode="contained"
              icon="logout"
              onPress={openSignOut}
              buttonColor={theme.colors.error}
              contentStyle={{ paddingVertical: 8 }}
            >
              Sign Out
            </Button>
          </View>

          {/* Version */}
          <View style={styles.section}>
            <Text variant="bodySmall" style={styles.versionText}>
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      <EditProfileModal visible={isEditProfileOpen} profile={profile!} onDismiss={closeEditProfile} />

      <EditInterpreterDetailsModal
        visible={isEditInterpreterOpen}
        profile={profile!}
        onDismiss={closeEditInterpreter}
      />

      <WarningDialog
        visible={isSignOutOpen}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        onDismiss={closeSignOut}
        onConfirm={handleSignOut}
      />
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    header: {
      paddingTop: 24,
      paddingBottom: 24,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    profileName: {
      color: theme.colors.surface,
      fontWeight: "bold",
      marginTop: 12,
    },
    profileEmail: {
      color: theme.colors.surface,
      opacity: 0.9,
      marginTop: 4,
    },
    badge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      marginTop: 12,
    },
    badgeText: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    content: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      color: theme.colors.primary,
      fontWeight: "bold",
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      overflow: "hidden",
    },
    versionText: {
      textAlign: "center",
      color: theme.colors.onSurfaceVariant,
    },
  });
