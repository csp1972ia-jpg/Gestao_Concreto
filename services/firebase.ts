import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFchzff3XyWaxdW0zIaCxQtvpAnixQb0E",
  authDomain: "supermix-d4e3b.firebaseapp.com",
  projectId: "supermix-d4e3b",
  storageBucket: "supermix-d4e3b.firebasestorage.app",
  messagingSenderId: "765130144276",
  appId: "1:765130144276:web:852a2c8fbba39becd84501",
  measurementId: "G-YVS7G43EMJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
