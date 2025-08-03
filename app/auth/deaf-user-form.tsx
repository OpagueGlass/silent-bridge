"use client";

import { states } from "@/constants/data";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Menu, Text, TextInput } from "react-native-paper";
import DatePickerInput from "../../components/DatePickerInput";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../hooks/useAppTheme";

export default function DeafUserFormScreen() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        dateOfBirth: "",
        gender: "",
        location: "",
    });
    const [genderMenuVisible, setGenderMenuVisible] = useState(false);
    const [stateMenuVisible, setStateMenuVisible] = useState(false);
    const router = useRouter();
    const { createUserProfile } = useAuth();
    const theme = useAppTheme();

    const handleSubmit = async () => {
        try {
            await createUserProfile({
                ...formData,
                userType: "deaf",
            });
            Alert.alert("Success", "Account created successfully!", [
                { text: "OK", onPress: () => router.replace("/auth") },
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to create account");
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                Deaf User Account
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                Enter your details
            </Text>
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
            <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
                Confirm
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24, // theme.spacing.lg
    },
    title: {
        textAlign: "center",
        marginBottom: 12, // theme.spacing.sm + 4
        marginTop: 40,
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 32, // theme.spacing.xl
    },
    input: {
        marginBottom: 16, // theme.spacing.md
    },
    submitButton: {
        marginTop: 24, // theme.spacing.lg
        paddingVertical: 8, // theme.spacing.sm
    },
});
