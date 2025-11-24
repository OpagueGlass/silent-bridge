import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ReviewModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (rating: number, comment: string) => void;
  targetName: string;
  sessionDate: string;
  placeholderText: string;
}

const ReviewModal = ({ 
  visible, 
  onDismiss, 
  onSubmit, 
  targetName, 
  sessionDate, 
  placeholderText 
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment('');
    }
  }, [visible]);

  const handleSubmit = () => {
    onSubmit(rating, comment);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              {targetName}
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              Review {new Date(sessionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} Session
            </Text>

            <Text style={styles.label}>Rating</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <MaterialCommunityIcons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= rating ? '#FFC107' : '#BDBDBD'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Comments</Text>
            <TextInput
              mode="outlined"
              placeholder={placeholderText}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              style={styles.textInput}
            />

            <View style={styles.buttonContainer}>
              <Button onPress={onDismiss} style={styles.button}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                Submit Review
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#616161', 
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#616161',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  textInput: {
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  button: {
    marginLeft: 8,
  },
});

export default ReviewModal;