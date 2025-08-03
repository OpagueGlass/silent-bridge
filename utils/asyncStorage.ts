// AsyncStorage polyfill for Firebase Auth
// This helps suppress the warning about missing AsyncStorage

import AsyncStorageLib from '@react-native-async-storage/async-storage';

// Set up global AsyncStorage for Firebase
if (typeof global !== 'undefined') {
  (global as any).AsyncStorage = AsyncStorageLib;
}

// Export for use in other parts of the app
export const AsyncStorage = AsyncStorageLib;
