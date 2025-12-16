"use client";

import { fetchToken, messaging } from "@/utils/firebase";
import { ActiveProfile, updateActiveProfile } from "@/utils/query";
import { useRouter } from "expo-router";
import { onMessage, Unsubscribe } from "firebase/messaging";
import { useEffect, useRef, useState } from "react";

async function getNotificationToken(profile: ActiveProfile) {
  if (!("Notification" in window)) {
    console.info("This browser does not support notifications");
    return null;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await fetchToken();
      if (!token || token !== profile.fcmToken) {
        await updateActiveProfile(profile.id, { fcm_token: token });
        console.log("FCM Token saved to profile:", token);
      }
      return token;
    }
  }

  console.warn("Notification permission not granted.");
  return null;
}

const useNotification = (profile: ActiveProfile) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const retryLoadToken = useRef(0);
  const isLoading = useRef(false);
  const [notification, setNotification] = useState<{
    visible: boolean;
    body: string;
    title: string;
    image: string;
    action: () => void;
  }>({ visible: false, body: "", title: "", image: "", action: () => {} });

  const loadToken = async () => {
    // Prevent multiple fetches if already fetched or in progress.
    if (isLoading.current) return;

    isLoading.current = true;
    const token = await getNotificationToken(profile);

    if (Notification.permission === "denied") {
      console.warn("Notification permission not granted.");
      isLoading.current = false;
      return;
    }

    // Retry fetching the token if necessary as the service worker may not be ready/installed yet.
    if (!token) {
      if (retryLoadToken.current >= 3) {
        // alert("Unable to load token, refresh the browser");
        console.warn("Unable to load token after 3 retries");
        isLoading.current = false;
        return;
      }

      retryLoadToken.current += 1;
      console.error("An error occurred while retrieving token. Retrying...");
      isLoading.current = false;
      await loadToken();
      return;
    }
    setToken(token);
    isLoading.current = false;
  };

  useEffect(() => {
    if ("Notification" in window) {
      loadToken();
    }
  }, []);

  useEffect(() => {
    const setupListener = async () => {
      if (!token) return;

      // Register a listener for incoming FCM messages.
      const unsubscribe = onMessage(messaging, (payload) => {
        if (Notification.permission !== "granted") return;

        console.log("Foreground push notification received:", payload);
        const { body, title, image } = payload.notification! as {
          body: string;
          title: string;
          image: string;
        };
        const link = payload.data!.link as "/" | "/request" | `/chat/${string}`;
        setNotification({
          visible: true,
          body,
          title,
          image,
          action: () => router.push(link),
        });
      });

      return unsubscribe;
    };

    let unsubscribe: Unsubscribe | null = null;

    setupListener().then((unsub) => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    // Cleanup the listener when the component unmounts.
    return () => unsubscribe?.();
  }, [token, router, notification]);

  return { token, notification, setNotification };
};

export default useNotification;
