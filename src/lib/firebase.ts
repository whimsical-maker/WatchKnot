import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-YMDdew386ST7poAFwzt0siq7n_QbDC0",
  authDomain: "watchknot.firebaseapp.com",
  projectId: "watchknot",
  storageBucket: "watchknot.firebasestorage.app",
  messagingSenderId: "476893207689",
  appId: "1:476893207689:web:c2dd467a4f95e5e717fa58",
  measurementId: "G-04SE5G5VKQ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
