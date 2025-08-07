import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxSeKYd-bSUNCxoEMRdjGsXtxqftaetP8",
  authDomain: "schedulecalendar-sicu1.firebaseapp.com",
  projectId: "schedulecalendar-sicu1",
  storageBucket: "schedulecalendar-sicu1.firebasestorage.app",
  messagingSenderId: "122700713678",
  appId: "1:122700713678:web:90d24275503f934ef40a9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);