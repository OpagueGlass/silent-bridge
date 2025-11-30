import { LANGUAGES, SPEC, SPECIALISATION } from "@/constants/data";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDisclosure } from "@/hooks/useDisclosure";
import { ActiveProfile, getInterpreterProfile } from "@/utils/query";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Checkbox, IconButton, MD3Theme, Modal, Portal, Text } from "react-native-paper";
import WarningDialog from "./WarningDialog";

interface EditInterpreterDetailsModalProps {
  visible: boolean;
  profile: ActiveProfile;
  onDismiss: () => void;
}

export default function EditInterpreterDetailsModal({ visible, profile, onDismiss }: EditInterpreterDetailsModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [specialisations, setSpecialisations] = useState<boolean[]>([]);
  const [languages, setLanguages] = useState<boolean[]>([]);
  const [formData, setFormData] = useState({
    specialisations: specialisations,
    languages: languages,
  });
  const [error, setError] = useState<{ title: string; message: string | null } | null>(null);
  const { isOpen, open, close } = useDisclosure();

  const fetchInterpreterData = useCallback(async () => {
    if (!profile.id) return;

    const interpreterData = await getInterpreterProfile(profile.id);
    if (interpreterData) {
      const defaultSpecialisations = SPEC.map((_) => false);
      interpreterData.interpreterSpecialisations.forEach((spec) => {
        defaultSpecialisations[spec] = true;
      });
      setSpecialisations(defaultSpecialisations);

      const defaultLanguages = LANGUAGES.map((_) => false);
      interpreterData.interpreterLanguages.forEach((lang) => {
        defaultLanguages[lang] = true;
      });
      setLanguages(defaultLanguages);
      setFormData({
        specialisations: defaultSpecialisations,
        languages: defaultLanguages,
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchInterpreterData();
  }, [fetchInterpreterData]);

  const validateForm = () => {
    if (!formData.specialisations.some((selected) => selected)) {
      setError({ title: "Invalid Specialisations", message: "Please select at least one specialisation" });
      return;
    }
    if (!formData.languages.some((selected) => selected)) {
      setError({ title: "Invalid Languages", message: "Please select at least one language" });
      return;
    }
    setError(null);
    open();
  };

  const handleSave = async () => {
    const interpreterLanguageData = formData.languages.flatMap((langSelected, index) =>
      langSelected ? [{ interpreter_id: profile.id, language_id: index + 1 }] : []
    );

    const interpreterSpecialisationData = formData.specialisations.flatMap((specSelected, index) =>
      specSelected ? [{ interpreter_id: profile.id, specialisation_id: index + 1 }] : []
    );

    await supabase.from("interpreter_language").delete().eq("interpreter_id", profile.id);    
    await supabase.from("interpreter_specialisation").delete().eq("interpreter_id", profile.id);
    await supabase.from("interpreter_language").insert(interpreterLanguageData);
    await supabase.from("interpreter_specialisation").insert(interpreterSpecialisationData);

    setSpecialisations(formData.specialisations);
    setLanguages(formData.languages);
    close();
    onDismiss();
  };

  const handleReset = () => {
    // Reset to current values
    setFormData({
      specialisations: [...specialisations],
      languages: [...languages],
    });
  };

  const handleCancel = () => {
    // Reset to current values

    onDismiss();
    handleReset();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: "bold" }}>
              Edit Interpreter Details
            </Text>
            <IconButton icon="close" size={24} onPress={handleCancel} iconColor={theme.colors.onSurface} />
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody}>
            {/* Specialisations Section */}
            <Card style={styles.checkboxCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Specialisations
                </Text>
                <Text variant="bodySmall" style={styles.sectionSubtitle}>
                  Select all that apply
                </Text>
                <View style={styles.checkboxGrid}>
                  {SPECIALISATION.map((specialisation, index) => (
                    <View key={SPEC[index]} style={styles.checkboxItem}>
                      <Checkbox
                        status={formData.specialisations[index] ? "checked" : "unchecked"}
                        onPress={() => {
                          const newSpecialisations = [...formData.specialisations];
                          newSpecialisations[index] = !newSpecialisations[index];
                          setFormData({ ...formData, specialisations: newSpecialisations });
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
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Languages
                </Text>
                <Text variant="bodySmall" style={styles.sectionSubtitle}>
                  Select all that apply
                </Text>
                <View style={styles.checkboxGrid}>
                  {LANGUAGES.map((language, index) => (
                    <View key={language.toLowerCase()} style={styles.checkboxItem}>
                      <Checkbox
                        status={formData.languages[index] ? "checked" : "unchecked"}
                        onPress={() => {
                          const newLanguages = [...formData.languages];
                          newLanguages[index] = !newLanguages[index];
                          setFormData({ ...formData, languages: newLanguages });
                        }}
                      />
                      <Text style={styles.checkboxLabel}>{language}</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </ScrollView>

          {/* Footer */}
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
        message="Are you sure you want to save these changes to your interpreter details?"
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
      padding: 4,
    },
    modalContent: {
      borderRadius: 12,
      maxWidth: 500,
      maxHeight: "90%",
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
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    sectionTitle: {
      fontWeight: "bold",
      marginBottom: 5,
      color: theme.colors.onSurface,
    },
    sectionSubtitle: {
      marginBottom: 15,
      color: theme.colors.onSurfaceVariant,
    },
    checkboxCard: {
      marginBottom: 20,
      backgroundColor: theme.colors.elevation.level1,
      borderRadius: 12,
    },
    checkboxGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
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
      color: theme.colors.onSurface,
      flex: 1,
      flexWrap: "wrap",
    },
    modalFooter: {
      flexDirection: "row",
      gap: 12,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
  });
