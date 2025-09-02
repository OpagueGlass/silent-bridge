'use client';

import { STATES } from '@/constants/data';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Menu, Text, TextInput } from 'react-native-paper';
import DatePickerInput from '../../components/DatePickerInput';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { showError, showSuccess, showValidationError } from '../../utils/alert';
import { supabase } from '@/utils/supabase';
import { parseDate } from '@/utils/helper';

export default function DeafUserFormScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    location: '',
  });
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [stateMenuVisible, setStateMenuVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const theme = useAppTheme();
  const { session } = useAuth();

  const handleSignUp = async () => {
    const validateForm = () => {
      if (!formData.name.trim()) {
        showValidationError('Please enter your name');
        return false;
      }
      if (!formData.dateOfBirth) {
        showValidationError('Please select your date of birth');
        return false;
      }
      if (!formData.gender) {
        showValidationError('Please select your gender');
        return false;
      }
      if (!formData.location) {
        showValidationError('Please select your state');
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
        date_of_birth: parseDate(formData.dateOfBirth).toISOString(),
        gender: formData.gender,
        location: formData.location,
        photo: session!.user.user_metadata.avatar_url,
      };

      const { error } = await supabase.from('profile').insert(profileData);
      if (error) throw error
      showSuccess('Account created successfully!');
      router.replace('/auth/callback');
    } catch (error: any) {
      showError(error.message || 'Failed to create account with Google. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Deaf User Account
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Enter your details
      </Text>
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
            setFormData({ ...formData, gender: 'Male' });
            setGenderMenuVisible(false);
          }}
          title="Male"
        />
        <Menu.Item
          onPress={() => {
            setFormData({ ...formData, gender: 'Female' });
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
      <Button
        mode="contained"
        onPress={handleSignUp}
        style={styles.submitButton}
        icon="google"
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating Account...' : 'Continue with Google'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2196F3',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
});
