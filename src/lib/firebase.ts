import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGF4li4IF_HmXGWZKPPJp2aKSS79iNZxw",
  authDomain: "msigsx-osr-project.firebaseapp.com",
  projectId: "msigsx-osr-project",
  storageBucket: "msigsx-osr-project.firebasestorage.app",
  messagingSenderId: "950653626054",
  appId: "1:950653626054:web:2d9e119eeb3029591f99c7",
  measurementId: "G-LQ2J0L8E8D"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
