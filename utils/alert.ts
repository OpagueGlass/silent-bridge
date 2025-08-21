import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

// Custom web modal function to replace browser's confirm dialog
const showWebModal = (title: string, message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    // Create title
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    `;

    // Create message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.cssText = `
      margin: 0 0 24px 0;
      font-size: 14px;
      line-height: 1.5;
      color: #666;
    `;

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    `;

    // Create Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    // Create OK button
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.cssText = `
      padding: 8px 16px;
      border: none;
      background: #007AFF;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    // Add event listeners
    const cleanup = () => document.body.removeChild(overlay);
    
    cancelButton.onclick = () => {
      cleanup();
      resolve(false);
    };
    
    okButton.onclick = () => {
      cleanup();
      resolve(true);
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    };

    // Assemble modal
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(okButton);
    modal.appendChild(titleElement);
    modal.appendChild(messageElement);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus OK button
    okButton.focus();
  });
};

export const showAlert = (
  title: string,
  message: string,
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    showWebModal(title, message).then((result) => {
      if (buttons && buttons.length > 0) {
        const primaryButton = buttons.find(btn => btn.style !== 'cancel') || buttons[0];
        if (result && primaryButton?.onPress) {
          primaryButton.onPress();
        } else {
          const cancelButton = buttons.find(btn => btn.style === 'cancel');
          if (!result && cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      }
    });
  } else {
    Alert.alert(title, message, buttons);
  }
};

export const showConfirmAlert = (
  title: string,
  message: string
): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return showWebModal(title, message);
  } else {
    return new Promise((resolve) => {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'OK', onPress: () => resolve(true) }
      ]);
    });
  }
};

export const showValidationError = (message: string) => {
  showAlert('Validation Error', message);
};

export const showError = (message: string) => {
  showAlert('Error', message);
};

export const showSuccess = (message: string, onPress?: () => void) => {
  showAlert('Success', message, [{ text: 'OK', onPress }]);
};
