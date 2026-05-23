// Firebase Configuration for BAKAL GYM
// This file initializes Firebase app, Firestore, and Authentication

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIU8ifdcrNfgms51E0phOOIlGG-X48DiI",
  authDomain: "adv2ndyrgym-registration-final.firebaseapp.com",
  databaseURL:
    "https://adv2ndyrgym-registration-final-default-rtdb.firebaseio.com",
  projectId: "adv2ndyrgym-registration-final",
  storageBucket: "adv2ndyrgym-registration-final.firebasestorage.app",
  messagingSenderId: "541794136427",
  appId: "1:541794136427:web:813cd96f1808bf37261c2e",
  measurementId: "G-CBD0DPYGF6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;