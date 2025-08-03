"use client"

import { useState } from "react"
import { Text, StyleSheet, ScrollView, Alert, View, Pressable } from "react-native"
import { TextInput, Button, Menu } from "react-native-paper"
import { useRouter } from "expo-router"
import { useAuth } from "../../contexts/AuthContext"
import DatePickerInput from "../../components/DatePickerInput";
import { states } from "@/constants/data"

export default function InterpreterFormScreen() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    location: "",
    specialisation: "",
  })
  const [genderMenuVisible, setGenderMenuVisible] = useState(false)
  const [stateMenuVisible, setStateMenuVisible] = useState(false);
  const router = useRouter()
  const { createUserProfile } = useAuth()

  const handleSubmit = async () => {
    try {
      await createUserProfile({
        ...formData,
        userType: "interpreter",
      })
      Alert.alert("Success", "Account created successfully!", [{ text: "OK", onPress: () => router.replace("/auth") }])
    } catch (error) {
      Alert.alert("Error", "Failed to create account")
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Interpreter Account</Text>
      <Text style={styles.subtitle}>Enter your details</Text>
      <TextInput
        label="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <DatePickerInput
        label="Date of Birth"
        value={formData.dateOfBirth}
        onChange={(dateString) => setFormData({ ...formData, dateOfBirth: dateString })}
        placeholder="Select your date of birth"
        style={styles.input}
      />
      <Menu
          visible={genderMenuVisible}
          onDismiss={() => setGenderMenuVisible(false)}
          anchor={
                  <Pressable onPress={() => setGenderMenuVisible(true)}>
                    <View pointerEvents="none">
                        <TextInput
                            label="Gender"
                            value={formData.gender}
                            mode="outlined"
                            style={styles.input}
                            right={<TextInput.Icon icon="chevron-down" onPress={() => setGenderMenuVisible(true)} />}
                            showSoftInputOnFocus={false}
                            editable={false}
                        />
                    </View>
                  </Pressable>
          }
      >
        <Menu.Item
          onPress={() => {
            setFormData({ ...formData, gender: "Male" })
            setGenderMenuVisible(false)
          }}
          title="Male"
        />
        <Menu.Item
          onPress={() => {
            setFormData({ ...formData, gender: "Female" })
            setGenderMenuVisible(false)
          }}
          title="Female"
        />
      </Menu>
                  <Menu
                      visible={stateMenuVisible}
                      onDismiss={() => setStateMenuVisible(false)}
                      anchor={
                    <Pressable onPress={() => setStateMenuVisible(true)}>
                      <View pointerEvents="none">
                        <TextInput
                            label="State"
                            value={formData.location}
                            mode="outlined"
                            style={styles.input}
                            right={<TextInput.Icon icon="chevron-down" onPress={() => setStateMenuVisible(true)} />}
                            showSoftInputOnFocus={false}
                            editable={false}
                        />
                      </View>
                  </Pressable>
                      }
                  >
                    {states.map((state) => (
                          <Menu.Item
                              key={state}
                              onPress={() => {
                                  setFormData({ ...formData, location: state });
                                  setStateMenuVisible(false);
                              }}
                              title={state}
                          />
                      ))}
                  </Menu>
      <TextInput
        label="Specialisation"
        value={formData.specialisation}
        onChangeText={(text) => setFormData({ ...formData, specialisation: text })}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={3}
      />
      <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
        Confirm
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2196F3",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
})
