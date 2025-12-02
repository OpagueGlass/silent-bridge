import { STATES } from "@/constants/data";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDisclosure } from "@/hooks/useDisclosure";
import { ActiveProfile, updateActiveProfile } from "@/utils/query";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, IconButton, MD3Theme, Modal, Portal, Text, TextInput } from "react-native-paper";
import DatePickerInput, { getToday } from "../inputs/DatePickerInput";
import { DropdownInput } from "../inputs/DropdownInput";
import WarningDialog from "./WarningDialog";

const genders = ["Male", "Female"];

interface EditProfileModalProps {
  visible: boolean;
  profile: ActiveProfile;
  onDismiss: () => void;
}

const defaultFormData = (profile: ActiveProfile) => ({
  name: profile.name,
  dateOfBirth: new Date(profile.dateOfBirth) as Date | undefined,
  gender: profile.gender,
  location: profile.location,
});

export default function EditProfileModal({ visible, profile, onDismiss }: EditProfileModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const { setProfile } = useAuth();
  const [formData, setFormData] = useState(defaultFormData(profile));
  const { isOpen, open, close } = useDisclosure();
  const [error, setError] = useState<{ title: string; message: string | null } | null>(null);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError({ title: "Invalid Name", message: "Please enter your name" });
      return;
    }
    if (formData.dateOfBirth === undefined) {
      setError({ title: "Invalid Date of Birth", message: "Please select your date of birth" });
      return;
    }
    if (!formData.gender) {
      setError({ title: "Invalid Gender", message: "Please select your gender" });
      return;
    }
    if (!formData.location) {
      setError({ title: "Invalid State", message: "Please select your state" });
      return;
    }
    open();
  };

  const handleSave = async () => {
    const { dateOfBirth, ...rest } = formData;
    const formattedData = {
      ...rest,
      date_of_birth: dateOfBirth!.toISOString(),
    };

    try {
      await updateActiveProfile(profile.id, formattedData);
      setProfile({ ...profile, ...formattedData, dateOfBirth: dateOfBirth!.toISOString() });
      onDismiss();
      close();
    } catch (error: any) {
      setError({ title: "Update Error", message: `Failed to update profile: ${error.message}` });
    }
  };

  const handleReset = () => {
    setFormData(defaultFormData(profile));
  };

  const handleDismiss = () => {
    handleReset();
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: "bold" }}>
              Edit Profile
            </Text>
            <IconButton icon="close" size={24} onPress={handleDismiss} iconColor={theme.colors.onSurface} />
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Name"
                value={formData.name}
                onChangeText={(name) => setFormData({ ...formData, name })}
                mode="outlined"
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <DatePickerInput
                date={formData.dateOfBirth}
                setDate={(dateOfBirth) => setFormData({ ...formData, dateOfBirth })}
                validRange={{ startDate: undefined, endDate: getToday() }}
                placeholder="Date of Birth"
                showLabel={true}
              />
            </View>

            <DropdownInput
              container={genders}
              option={formData.gender}
              setOption={(gender) => setFormData({ ...formData, gender })}
              label="Gender"
              style={styles.inputContainer}
            />

            <DropdownInput
              container={STATES}
              option={formData.location}
              setOption={(location) => setFormData({ ...formData, location })}
              label="State"
              style={styles.inputContainer}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button mode="outlined" icon="refresh" onPress={handleReset} style={{ flex: 1 }}>
              Reset
            </Button>
            <Button mode="contained" icon="check" onPress={validateForm} style={{ flex: 1 }}>
              Save Changes
            </Button>
          </View>
        </View>
      </Modal>
      <WarningDialog
        visible={error !== null}
        title={error?.title ?? ""}
        message={error?.message ?? ""}
        onDismiss={() => setError(null)}
        onConfirm={() => setError(null)}
      />
      <WarningDialog
        visible={isOpen}
        title="Confirm Changes"
        message="Are you sure you want to save these changes to your profile?"
        onDismiss={close}
        onConfirm={handleSave}
      />
    </Portal>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    modalContainer: {
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      boxShadow: "0"
    },
    modalContent: {
      borderRadius: 12,
      width: "100%",
      maxWidth: 500,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 5,
      paddingBottom: 4,
      borderBottomWidth: 1,
    },
    modalBody: {
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    inputContainer: {
      marginBottom: 16,
    },
    input: {
      backgroundColor: theme.colors.surface,
    },
    modalFooter: {
      flexDirection: "row",
      gap: 12,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
  });
