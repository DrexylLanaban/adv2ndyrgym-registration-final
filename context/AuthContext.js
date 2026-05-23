// BAKAL GYM - Authentication Context
// Manages global auth state and user data

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { USER_ROLES, ADMIN_EMAIL } from "../constants";
import { checkAndUpdateExpiredMemberships } from "../services/MembershipService";

// Create the Auth Context
const AuthContext = createContext({});

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider wraps the entire app and provides auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);         // Firebase auth user object
  const [userData, setUserData] = useState(null); // Firestore user document
  const [loading, setLoading] = useState(true);   // Loading state while auth initializes

  // ============================================================
  // LISTEN to Firebase auth state changes
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user data from Firestore
        await fetchUserData(firebaseUser.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Periodically check and auto-expire memberships (runs in background regardless of admin)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await checkAndUpdateExpiredMemberships();
      } catch (err) {
        console.error('Auto-expire check failed:', err);
      }
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // READ: Fetch user document from Firestore
  // ============================================================
  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserData({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // ============================================================
  // CREATE: Register new user
  // ============================================================
  const register = async (email, password, displayName, phone = "") => {
    try {
      // Create auth account
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create Firestore user document
      const userDocData = {
        uid: firebaseUser.uid,
        email,
        displayName,
        phone,
        role: USER_ROLES.USER,
        activeMembershipId: null,
        membershipStatus: "none",
        membershipExpiry: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userDocData);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // READ: Login user
  // ============================================================
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // Logout user
  // ============================================================
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // UPDATE: Update user profile in Firestore
  // ============================================================
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error("Not authenticated");

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Refresh local user data
      await fetchUserData(user.uid);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // DELETE: Delete user account
  // ============================================================
  const deleteAccount = async (password) => {
    try {
      if (!user) throw new Error("Not authenticated");

      // Re-authenticate before deleting
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete Firestore document first
      await deleteDoc(doc(db, "users", user.uid));

      // Delete Firebase Auth account
      await deleteUser(user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // ADMIN SEEDING: Create admin account if it doesn't exist
  // ============================================================
  const seedAdminAccount = async (email, password, displayName) => {
    try {
      // Create admin auth account
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create admin Firestore document
      const adminDocData = {
        uid: firebaseUser.uid,
        email,
        displayName,
        role: USER_ROLES.ADMIN,
        activeMembershipId: null,
        membershipStatus: "none",
        membershipExpiry: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), adminDocData);

      return { success: true, message: "Admin account created successfully" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ============================================================
  // Helper: Check if user is admin
  // ============================================================
  const isAdmin = userData?.role === USER_ROLES.ADMIN;

  // Provide context values
  const value = {
    user,
    userData,
    loading,
    isAdmin,
    register,
    login,
    logout,
    updateProfile,
    deleteAccount,
    fetchUserData,
    seedAdminAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};