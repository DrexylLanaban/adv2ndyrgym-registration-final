// BAKAL GYM - Admin Setup Service
// Helper to initialize admin account for testing

import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { USER_ROLES, ADMIN_EMAIL } from "../constants";

/**
 * Creates admin account with default credentials
 * Run this once during app initialization or manually
 * 
 * DEFAULT ADMIN CREDENTIALS:
 * Email: admin@bakalgym.com
 * Password: 123123
 * 
 * Returns: { success: boolean, message: string, error?: string }
 */
export const createAdminAccount = async () => {
  const ADMIN_PASSWORD = "123123";
  const ADMIN_NAME = "Admin User";

  try {
    // Check if admin already exists
    const adminDocRef = doc(db, "users");
    const adminQuery = await getDoc(doc(db, "users", "admin_check"));

    console.log("Creating admin account...");

    // Create Firebase Auth account
    const { user: firebaseUser } = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    console.log(`Auth account created: ${firebaseUser.uid}`);

    // Create Firestore admin document
    const adminDocData = {
      uid: firebaseUser.uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      phone: "+63 912 345 6789",
      role: USER_ROLES.ADMIN,
      activeMembershipId: null,
      membershipStatus: "none",
      membershipExpiry: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid), adminDocData);

    console.log("Admin document created in Firestore");

    // Sign out admin after creation
    await signOut(auth);

    return {
      success: true,
      message: `Admin account created successfully!\n\nEmail: ${ADMIN_EMAIL}\nPassword: ${ADMIN_PASSWORD}`,
    };
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      return {
        success: true,
        message: `Admin account already exists!\n\nEmail: ${ADMIN_EMAIL}`,
      };
    }

    console.error("Error creating admin account:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify admin account exists and is properly configured
 */
export const verifyAdminAccount = async () => {
  try {
    // Try to sign in as admin
    const result = await signInWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      "123123"
    );

    if (result.user) {
      const adminDoc = await getDoc(doc(db, "users", result.user.uid));
      await signOut(auth);

      if (adminDoc.exists() && adminDoc.data().role === USER_ROLES.ADMIN) {
        return {
          success: true,
          message: "Admin account verified!",
          admin: adminDoc.data(),
        };
      } else {
        return {
          success: false,
          error: "User exists but is not an admin",
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Quick reference for admin credentials
 */
export const ADMIN_CREDENTIALS = {
  email: ADMIN_EMAIL,
  password: "123123",
  displayName: "Admin User",
  role: USER_ROLES.ADMIN,
};
