importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBGF4li4IF_HmXGWZKPPJp2aKSS79iNZxw",
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
