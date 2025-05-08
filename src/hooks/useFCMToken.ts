import { useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";

const VAPID_KEY = "BKJkGcjLb3TqY3ZBGA84vNUilx1aIeWuRz415TsCF2wrNBjQnWt8LEKM79Ss5vPTf-KdfHig_q0Aa_NkFHUvpEg"; // Get this from Firebase Console > Project Settings > Cloud Messaging

export function useFCMToken() {
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, { vapidKey: VAPID_KEY }).then((currentToken) => {
          if (currentToken) {
            console.log("FCM Token:", currentToken);
            // You can display it, copy it, or save it to Firestore for later use
          } else {
            console.log("No registration token available.");
          }
        }).catch((err) => {
          console.log("An error occurred while retrieving token. ", err);
        });
      }
    });

    // Optional: Listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      // Show custom notification or UI update
    });
  }, []);
}
