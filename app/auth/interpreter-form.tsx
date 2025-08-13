"use client";

import { LANGUAGES, SPEC, SPECIALISATION, STATES } from "@/constants/data";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Checkbox, Menu, TextInput } from "react-native-paper";
import DatePickerInput from "../../components/DatePickerInput";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";
import { showError, showSuccess, showValidationError } from "../../utils/alert";
import { supabase } from "@/utils/supabase";

export default function InterpreterFormScreen() {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    location: "",
    ...SPEC.reduce((acc, spec) => {
      acc[spec] = false;
      return acc;
    }, {} as Record<string, boolean>),

    ...LANGUAGES.reduce((acc, lang) => {
      acc[lang.toLowerCase()] = false;
      return acc;
    }, {} as Record<string, boolean>),
  });
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [stateMenuVisible, setStateMenuVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const theme = useAppTheme();
  const toggleSpecialisation = (specialisation: string) => {
    setFormData({
      ...formData,
      [specialisation]: !formData[specialisation as keyof typeof formData],
    });
  };

  const toggleLanguage = (language: string) => {
    setFormData({
      ...formData,
      [language]: !formData[language as keyof typeof formData],
    });
  };

  const handleSignUp = async () => {
    const validateForm = () => {
      if (!formData.name.trim()) {
        showValidationError("Please enter your name");
        return false;
      }
      if (!formData.dateOfBirth) {
        showValidationError("Please select your date of birth");
        return false;
      }
      if (!formData.gender) {
        showValidationError("Please select your gender");
        return false;
      }
      if (!formData.location) {
        showValidationError("Please select your state");
        return false;
      }

      const hasSpecialisation = SPEC.some((spec) => formData[spec as keyof typeof formData]);
      if (!hasSpecialisation) {
        showValidationError("Please select at least one specialisation");
        return false;
      }

      const hasLanguage = LANGUAGES.some((lang) => formData[lang.toLowerCase() as keyof typeof formData]);
      if (!hasLanguage) {
        showValidationError("Please select at least one language");
        return false;
      }

      return true;
    };

    const parseDate = (dateString: string) => {
      const [day, month, year] = dateString.split("/").map((num) => parseInt(num, 10));
      return new Date(year, month - 1, day);
    };

    try {
      setIsSubmitting(true);

      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      const profileData = {
        id: session!.user.id,
        name: formData.name,
        email: session!.user.email,
        date_of_birth: parseDate(formData.dateOfBirth).toISOString(),
        gender: formData.gender,
        location: formData.location,
        photo: session!.user.user_metadata.avatar_url,
      };

      const interpreterProfileData = {
        id: session!.user.id,
        ...SPEC.reduce((acc, spec) => {
          acc[spec] = Boolean(formData[spec as keyof typeof formData]);
          return acc;
        }, {} as Record<string, boolean>),

        ...LANGUAGES.reduce((acc, lang) => {
          acc[lang.toLowerCase()] = Boolean(formData[lang.toLowerCase() as keyof typeof formData]);
          return acc;
        }, {} as Record<string, boolean>),
      };

      const { error } = await supabase.from("profile").insert(profileData);
      if (error) throw error;

      const { error: interpreterError } = await supabase.from("interpreter_profile").insert(interpreterProfileData);
      if (interpreterError) throw interpreterError;

      showSuccess("Account created successfully!");
      router.replace("/(tabs)");
    } catch (error: any) {
      showError(error.message || "Failed to create account with Google. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            setFormData({ ...formData, gender: "Male" });
            setGenderMenuVisible(false);
          }}
          title="Male"
        />
        <Menu.Item
          onPress={() => {
            setFormData({ ...formData, gender: "Female" });
            setGenderMenuVisible(false);
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
        {STATES.map((state) => (
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

      {/* Specialisations Section */}
      <Card style={styles.checkboxCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Specialisations</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.checkboxGrid}>
            {SPECIALISATION.map((specialisation, index) => (
              <View key={SPEC[index]} style={styles.checkboxItem}>
                <Checkbox
                  status={formData[SPEC[index] as keyof typeof formData] ? "checked" : "unchecked"}
                  onPress={() => toggleSpecialisation(SPEC[index])}
                />
                <Text style={styles.checkboxLabel}>{specialisation}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Languages Section */}
      <Card style={styles.checkboxCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.checkboxGrid}>
            {LANGUAGES.map((language) => {
              const lower = language.toLowerCase();
              return (
                <View key={lower} style={styles.checkboxItem}>
                  <Checkbox
                    status={formData[lower as keyof typeof formData] ? "checked" : "unchecked"}
                    onPress={() => toggleLanguage(lower)}
                  />
                  <Text style={styles.checkboxLabel}>{language}</Text>
                </View>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSignUp}
        style={styles.submitButton}
        icon="google"
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Account..." : "Continue with Google"}
      </Button>
    </ScrollView>
  );
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
    color: "#1e293b",
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: "#64748b",
  },
  checkboxCard: {
    marginBottom: 20,
    backgroundColor: "#f1f5f9",
    // elevation: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    // shadowOpacity: 0.2,
    // shadowRadius: 1.41,
    borderRadius: 8,
    borderColor: "#e2e8f0",
    borderWidth: 0.2,
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    width: "48%",
    minWidth: 150,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
    flexWrap: "wrap",
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
});
