importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Note: Service workers can't use import.meta.env, so we'll need to inject these values during build
// For now, using placeholder values - you'll need to replace these with your new API key
firebase.initializeApp({
  apiKey: "YOUR_NEW_API_KEY_HERE",
  authDomain: "msigsx-osr-project.firebaseapp.com",
  projectId: "msigsx-osr-project",
  storageBucket: "msigsx-osr-project.appspot.com",
  messagingSenderId: "950653626054",
  appId: "1:950653626054:web:2d9e119eeb3029591f99c7",
  measurementId: "G-LQ2J0L8E8D"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo-png-only.webp'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
