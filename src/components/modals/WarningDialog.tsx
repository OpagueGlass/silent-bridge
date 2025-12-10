import { theme } from "@/theme/theme";
import { StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

interface WarningModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDanger?: boolean;
}

export default function WarningDialog({
  visible,
  onDismiss,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDanger = false,
}: WarningModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onDismiss();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleCancel}>{cancelText}</Button>
          <Button onPress={handleConfirm} mode="contained" buttonColor={isDanger ? theme.colors.error : undefined}>
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 12,
    maxWidth: 400,
    width: "90%",
    alignSelf: "center",
  },
});
