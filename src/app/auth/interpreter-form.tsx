"use client";

import WarningDialog from "@/components/modals/WarningDialog";
import { LANGUAGES, SPEC, SPECIALISATION, STATES } from "@/constants/data";
import { theme } from "@/theme/theme";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Checkbox, Menu, TextInput } from "react-native-paper";
import DatePickerInput, { getToday } from "../../components/inputs/DatePickerInput";
import { useAuth } from "../../contexts/AuthContext";

export default function InterpreterFormScreen() {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: undefined as Date | undefined,
    gender: "",
    location: "",
    specialisations: SPEC.map((_) => false),
    languages: LANGUAGES.map((_) => false),
  });
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [stateMenuVisible, setStateMenuVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [success, showSuccess] = useState(false);

  const handleSignUp = async () => {
    const validateForm = () => {
      if (!formData.name.trim()) {
        setError({ title: "Invalid Name", message: "Please enter your name" });
        return false;
      }
      if (!formData.dateOfBirth) {
        setError({ title: "Invalid Date of Birth", message: "Please select your date of birth" });
        return false;
      }
      if (!formData.gender) {
        setError({ title: "Invalid Gender", message: "Please select your gender" });
        return false;
      }
      if (!formData.location) {
        setError({ title: "Invalid State", message: "Please select your state" });
        return false;
      }

      if (!formData.specialisations.some((spec) => spec)) {
        setError({ title: "Invalid Specialisation", message: "Please select at least one specialisation" });
        return false;
      }

      if (!formData.languages.some((lang) => lang)) {
        setError({ title: "Invalid Language", message: "Please select at least one language" });
        return false;
      }

      return true;
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
        email: session!.user.email!,
        date_of_birth: formData.dateOfBirth!.toISOString(),
        gender: formData.gender,
        location: formData.location,
        photo: session!.user.user_metadata.avatar_url,
      };

      const interpreterProfileData = {
        id: session!.user.id,
      };

      const interpreterLanguageData = formData.languages.flatMap((langSelected, index) =>
        langSelected ? [{ interpreter_id: session!.user.id, language_id: index + 1 }] : []
      );

      const interpreterSpecialisationData = formData.specialisations.flatMap((specSelected, index) =>
        specSelected ? [{ interpreter_id: session!.user.id, specialisation_id: index + 1 }] : []
      );

      const { error } = await supabase.from("profile").insert(profileData);
      if (error) throw error;

      const { error: interpreterError } = await supabase.from("interpreter_profile").insert(interpreterProfileData);
      if (interpreterError) throw interpreterError;

      const { error: languageError } = await supabase.from("interpreter_language").insert(interpreterLanguageData);

      if (languageError) throw languageError;

      const { error: specialisationError } = await supabase
        .from("interpreter_specialisation")
        .insert(interpreterSpecialisationData);
      if (specialisationError) throw specialisationError;

      showSuccess(true);
    } catch (error: any) {
      setError({
        title: "Registration Error",
        message: error.message || "Failed to create account with Google. Please try again.",
      });
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
        date={formData.dateOfBirth}
        setDate={(date) => {
          setFormData({ ...formData, dateOfBirth: date });
        }}
        validRange={{ startDate: undefined, endDate: getToday() }}
        placeholder="Date of Birth"
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
                  status={formData.specialisations[index] ? "checked" : "unchecked"}
                  onPress={() => {
                    formData.specialisations[index] = !formData.specialisations[index];
                    setFormData({ ...formData });
                  }}
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
            {LANGUAGES.map((language, index) => {
              const lower = language.toLowerCase();
              return (
                <View key={lower} style={styles.checkboxItem}>
                  <Checkbox
                    status={formData.languages[index] ? "checked" : "unchecked"}
                    onPress={() => {
                      formData.languages[index] = !formData.languages[index];
                      setFormData({ ...formData });
                    }}
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
      <WarningDialog
        visible={error !== null}
        onConfirm={() => setError(null)}
        onDismiss={() => setError(null)}
        title={error?.title || ""}
        message={error?.message || ""}
      />
      <WarningDialog
        visible={success}
        onConfirm={() => {
          showSuccess(false);
          router.replace("/auth/callback");
        }}
        onDismiss={() => {
          showSuccess(false);
          router.replace("/auth/callback");
        }}
        title={"Registration Successful"}
        message={"Account created successfully!"}
      />
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
    backgroundColor: theme.colors.surface,
    // backgroundColor: "#f1f5f9",
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
