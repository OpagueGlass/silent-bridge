importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js");

// Initialize Firebase with your project credentials
firebase.initializeApp({
  apiKey: "AIzaSyCcfJmHZcJL0cM9VbCnglYLVv-ND81NptY",
  authDomain: "silent-bridge-cf4cf.firebaseapp.com",
  projectId: "silent-bridge-cf4cf",
  storageBucket: "silent-bridge-cf4cf.firebasestorage.app",
  messagingSenderId: "402723350070",
  appId: "1:402723350070:web:4a203f56ec76b5e4641a97",
  measurementId: "G-8LLY395SK4",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { link, title, body, photo } = payload.data;
  const notificationOptions = {
    body,
    icon: photo,
    data: { url: link },
  };

  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(clients.openWindow(targetUrl));
});
