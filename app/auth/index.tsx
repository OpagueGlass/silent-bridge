"use client"

import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, Image, StyleSheet, View } from "react-native"
import { Button, Text, TextInput } from "react-native-paper"
import { useAuth } from "../../contexts/AuthContext"
import { useAppTheme } from "../../hooks/useAppTheme"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const router = useRouter()
  const { signInWithGoogle } = useAuth()
  const theme = useAppTheme()

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      router.replace("/(tabs)")
    } catch (error) {
      Alert.alert("Error", "Failed to sign in with Google")
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image source={{ uri: "/placeholder.svg?height=100&width=100" }} style={styles.icon} />

      <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
        Welcome Back
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button mode="contained" onPress={handleGoogleSignIn} style={styles.googleButton} icon="google">
        Sign in with Google
      </Button>

      <Button mode="text" onPress={() => router.push("/auth/account-type")} style={styles.registerButton}>
        Don't have an account? Register
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24, // spacing.lg
    justifyContent: "center",
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 32, // spacing.xl
  },
  title: {
    textAlign: "center",
    marginBottom: 32, // spacing.xl
  },
  input: {
    marginBottom: 24, // spacing.lg
  },
  googleButton: {
    marginBottom: 16, // spacing.md
    paddingVertical: 8, // spacing.sm
  },
  registerButton: {
    marginTop: 16, // spacing.md
  },
})
