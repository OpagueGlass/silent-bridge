'use client';

import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function AccountTypeScreen() {
  const [accountType, setAccountType] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    if (accountType === 'deaf_user') {
      router.push('/auth/deaf-user-form');
    } else if (accountType === 'interpreter') {
      router.push('/auth/interpreter-form');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration</Text>
      <Text style={styles.subtitle}>Select Account Type</Text>

      <View style={styles.radioContainer}>
        <RadioButton.Group onValueChange={setAccountType} value={accountType}>
          <View style={styles.radioItem}>
            <RadioButton value="deaf_user" />
            <Text style={styles.radioLabel}>Deaf User</Text>
          </View>
          <View style={styles.radioItem}>
            <RadioButton value="interpreter" />
            <Text style={styles.radioLabel}>Interpreter</Text>
          </View>
        </RadioButton.Group>
      </View>

      <Button mode="contained" onPress={handleContinue} disabled={!accountType} style={styles.continueButton}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  radioContainer: {
    marginBottom: 40,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
  continueButton: {
    paddingVertical: 8,
  },
});
