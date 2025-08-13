// services/DatabaseService.js
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export class DatabaseService {
  /**
   * Get user profile from database
   */
  static async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(uid, profileData) {
    try {
      await updateDoc(doc(db, 'users', uid), profileData);
      return { success: true };
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Create or update user profile
   */
  static async createOrUpdateUserProfile(uid, profileData) {
    try {
      await setDoc(doc(db, 'users', uid), profileData, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Failed to create/update user profile:', error);
      throw error;
    }
  }
}
