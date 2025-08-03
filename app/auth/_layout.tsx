import { Stack } from "expo-router"

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="account-type" />
      <Stack.Screen name="deaf-user-form" />
      <Stack.Screen name="interpreter-form" />
    </Stack>
  )
}
