import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Modal, Portal, Text, Button, TextInput, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDisclosure } from "@/hooks/useDisclosure";
import { Appointment, Profile } from "@/utils/query";
import ReviewCard from "./ReviewCard";
import { useRouter } from "expo-router";
import { submitRating } from "@/utils/query";
import { getDate } from "@/utils/helper";

// interface ReviewModalProps {
//   visible: boolean;
//   onDismiss: () => void;
//   onSubmit: (rating: number, comment: string) => void;
//   targetName: string;
//   sessionDate: string;
//   placeholderText: string;
// }

// const handleSubmitReview = async (
//   appointments: Appointment[],
//   selectedAppointment: number,
//   profile: Profile,
//   rating: number,
//   comment: string
// ) => {
//   if (rating < 1 || rating > 5) {
//     // showAlert("Invalid Rating", "Please provide a rating between 1 and 5 stars.");
//     return;
//   }
//   await submitRating(selectedAppointment.id, profile!.id, selectedAppointment.profile!.id, rating, comment).catch(
//     (error) => {
//       console.error("Failed to submit review:", error);
//       // showAlert("Submission Failed", "There was an error submitting your review. Please try again.");
//     }
//   );
//   setCompletedAppointments((prev) => prev.filter((app) => app.id !== selectedAppointment.id));

//   if (selectedAppointment) {
//     if (rating < 1 || rating > 5) {
//       showAlert("Invalid Rating", "Please provide a rating between 1 and 5 stars.");
//       return;
//     }
//     await submitRating(selectedAppointment.id, profile!.id, selectedAppointment.profile!.id, rating, comment).catch(
//       (error) => {
//         console.error("Failed to submit review:", error);
//         showAlert("Submission Failed", "There was an error submitting your review. Please try again.");
//       }
//     );
//     setCompletedAppointments((prev) => prev.filter((app) => app.id !== selectedAppointment.id));
//   }
//   handleCloseReviewModal();
//   showAlert("Appointment Reviewed", "Thank you for your review!");
// };

async function submitReview(
  appointmentId: number,
  profileId: string,
  targetId: string,
  rating: number,
  comment: string,
  setCompletedAppointments: Dispatch<SetStateAction<Appointment[]>>,
  onClose: () => void
) {
  if (rating < 1 || rating > 5) {
    return;
  }

  await submitRating(appointmentId, profileId, targetId, rating, comment);
  setCompletedAppointments((prev) => prev.filter((app) => app.id !== appointmentId));
  onClose();
}

type ReviewModalProps = {
  appointment: Appointment | null;
  profile: Profile | null;
  isOpen: boolean;
  setReviewAppointments: Dispatch<SetStateAction<Appointment[]>>;
  onDismiss: () => void;
};

function ReviewModal({ appointment, profile, isOpen, setReviewAppointments, onDismiss }: ReviewModalProps) {
  if (!appointment || !profile) {
    return null;
  }

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment("");
    }
  }, [isOpen]);

  return (
    <Portal>
      <Modal visible={isOpen} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              {appointment?.profile?.name}
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              Review {getDate(appointment)} Session
            </Text>

            <Text style={styles.label}>Rating</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <MaterialCommunityIcons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color={star <= rating ? "#FFC107" : "#BDBDBD"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Comments</Text>
            <TextInput
              mode="outlined"
              placeholder={"Share your experience about the session"}
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
              <Button
                mode="contained"
                onPress={() =>
                  submitReview(
                    appointment?.id!,
                    profile!.id,
                    appointment?.profile!.id!,
                    rating,
                    comment,
                    setReviewAppointments,
                    onDismiss
                  )
                }
                style={styles.button}
              >
                Submit Review
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
}

type ReviewSectionProps = {
  profile: Profile | null;
  isInterpreter: boolean;
  reviewAppointments: Appointment[];
  setReviewAppointments: Dispatch<SetStateAction<Appointment[]>>;
  router: ReturnType<typeof useRouter>;
};

export default function ReviewSection({
  profile,
  isInterpreter,
  reviewAppointments,
  setReviewAppointments,
  router,
}: ReviewSectionProps) {
  const [index, setIndex] = useState(0);
  const { isOpen, open: openModal, close: closeModal } = useDisclosure(false);

  if (reviewAppointments.length === 0) {
    return <Text>No recent sessions to review.</Text>;
  } else {
    return (
    <>
      <FlatList
        data={reviewAppointments}
        horizontal
        keyExtractor={(a) => String(a.id)}
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ paddingVertical: 2, paddingHorizontal: 2 }}
        renderItem={({ item, index }) => (
          <View style={{ marginRight: 12, width: 320 }}>
            <ReviewCard
              appointment={item}
              isInterpreter={isInterpreter}
              router={router}
              onPress={() => {
                setIndex(index);
                openModal();
              }}
            />
          </View>
        )}
      />
        <ReviewModal
          appointment={reviewAppointments[index]}
          profile={profile}
          isOpen={isOpen}
          setReviewAppointments={setReviewAppointments}
          onDismiss={() => {
            closeModal();
          }}
        />
      </>
    );
  }

}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#616161",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    color: "#616161",
  },
  starsContainer: {
    flexDirection: "row",
  },
  textInput: {
    height: 100,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },
  button: {
    marginLeft: 8,
  },
});
