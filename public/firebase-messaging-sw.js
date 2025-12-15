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
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message. Please check it out",
    icon: "icon-192.png",
    data: { url: payload.fcmOptions?.link || "/" },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      }) /* Get all open browser tabs controlled by this service worker */
      .then((clientList) => {
        // Loop through each open tab/window
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus(); // If a matching tab exists, bring it to the front
          }
        }
        // If no matching tab is found, open a new one
        return clients.openWindow(targetUrl);
      })
  );
});
