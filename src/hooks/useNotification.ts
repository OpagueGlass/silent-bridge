"use client";

import { fetchToken, messaging } from "@/utils/firebase";
import { ActiveProfile, updateActiveProfile } from "@/utils/query";
import { useRouter } from "expo-router";
import { onMessage, Unsubscribe } from "firebase/messaging";
import { useEffect, useRef, useState } from "react";
import { NotificationType } from "@/utils/query";

export async function getNotificationToken(profile: ActiveProfile) {
  if (!("Notification" in window)) {
    console.info("This browser does not support notifications");
    return null;
  }

  let permission = Notification.permission;

  if (permission !== "denied") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    const token = await fetchToken();
    if (!token || token !== profile.fcmToken) {
      await updateActiveProfile(profile.id, { fcm_token: token });
      console.log("FCM Token saved to profile:", token);
    }
    return token;
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
    photo: string;
    action: () => void;
  }>({ visible: false, body: "", title: "", photo: "", action: () => {} });

  const loadToken = async () => {
    // Prevent multiple fetches if already fetched or in progress.
    if (isLoading.current) return;

    isLoading.current = true;
    const token = await getNotificationToken(profile);

    if (Notification.permission !== "granted") {
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
        const { body, title, photo, notification_type } = payload.data! as {
          body: string;
          title: string;
          photo: string;
          notification_type: `${NotificationType}`;
        };
        const link = payload.data!.link as "/" | "/request" | `/chat/${string}`;

        const notificationType = Number(notification_type) as NotificationType;
        if (notificationType === NotificationType.NEW_REQUEST) {
          window.dispatchEvent(new Event("refreshRequests"));
        } else if (
          notificationType === NotificationType.REQUEST_ACCEPTED ||
          notificationType === NotificationType.APPOINTMENT_CANCELLED
        ) {
          window.dispatchEvent(new Event("refreshAppointments"));
        }

        setNotification({
          visible: true,
          body,
          title,
          photo,
          action: () => {
            router.push(link);
          },
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
