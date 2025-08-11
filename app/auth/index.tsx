"use client"

import { useRouter } from "expo-router"
import { StyleSheet, View } from "react-native"
import { Button, Text } from "react-native-paper"
import { useAuth } from "../../contexts/AuthContext"
import { useAppTheme } from "../../hooks/useAppTheme"
import { showError } from "../../utils/alert"

export default function LoginScreen() {
  const router = useRouter()
  const { handleSignIn, authState } = useAuth()
  const theme = useAppTheme()

  const handleGoogleSignIn = async () => {
    try {
      await handleSignIn()
      if (authState.error) {
        showError(authState.error)
      }
    } catch (error) {
      showError("Failed to sign in with Google")
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* App Icon/Logo Area */}
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="headlineLarge" style={[styles.logoText, { color: theme.colors.onPrimaryContainer }]}>
            🤝
          </Text>
        </View>

        {/* Welcome Section */}
        <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
          Silent Bridge
        </Text>
        
        <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Connecting deaf users with interpreters
        </Text>

        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Join our community to find professional interpreters or offer your interpretation services.
        </Text>

        <Button 
          mode="contained" 
          onPress={handleGoogleSignIn} 
          style={[styles.googleButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.googleButtonContent}
          icon="google"
          loading={authState.isSigningIn}
          disabled={authState.isSigningIn}
        >
          {authState.isSigningIn ? "Signing in..." : "Continue with Google"}
        </Button>

        {/* Register Section */}
        <View style={styles.registerSection}>
          <Text variant="bodyMedium" style={[styles.registerText, { color: theme.colors.onSurfaceVariant }]}>
            New to Silent Bridge?
          </Text>
          <Button 
            mode="text" 
            onPress={() => router.push("/auth/account-type")} 
            style={styles.registerButton}
            textColor={theme.colors.primary}
          >
            Create Account
          </Button>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  logoText: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 48,
    marginHorizontal: 24,
    lineHeight: 24,
  },
  googleButton: {
    marginBottom: 24,
    borderRadius: 8,
  },
  googleButtonContent: {
    paddingVertical: 8,
  },
  registerSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    marginBottom: 8,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
  },
})
