"use client"

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"
import {
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    type User,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "../utils/firebase"

WebBrowser.maybeCompleteAuthSession()

interface UserProfile {
  id: string
  name: string
  email: string
  userType: "deaf" | "interpreter"
  dateOfBirth?: string
  gender?: string
  location?: string
  specialisation?: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  createUserProfile: (profileData: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "your-web-client-id",
    iosClientId: "your-ios-client-id",
    androidClientId: "your-android-client-id",
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await loadUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response
      if (authentication?.accessToken) {
        signInWithGoogleToken(authentication.accessToken)
      }
    }
  }, [response])

  const signInWithGoogleToken = async (accessToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(null, accessToken)
      await signInWithCredential(auth, credential)
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      await promptAsync()
    } catch (error) {
      console.error("Error initiating Google sign in:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      await AsyncStorage.clear()
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const docRef = doc(db, "users", userId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setUserProfile({
          id: userId,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UserProfile)
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const createUserProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("No authenticated user")

      const userProfile: UserProfile = {
        id: user.uid,
        name: profileData.name || "",
        email: user.email || "",
        userType: profileData.userType || "deaf",
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        location: profileData.location,
        specialisation: profileData.specialisation,
        createdAt: new Date(),
      }

      await setDoc(doc(db, "users", user.uid), userProfile)
      setUserProfile(userProfile)
    } catch (error) {
      console.error("Error creating user profile:", error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signOut,
    createUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
