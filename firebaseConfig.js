import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxg_zGq_EJ-ZlSdIU3jaqXYPbTva-4hZ0",
  authDomain: "idealab-app-11b25.firebaseapp.com",
  projectId: "idealab-app-11b25",
  storageBucket: "idealab-app-11b25.firebasestorage.app",
  messagingSenderId: "687859706096",
  appId: "1:687859706096:web:f3e139c06af20b87323a35"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);