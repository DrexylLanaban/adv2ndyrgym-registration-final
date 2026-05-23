// BAKAL GYM - Membership Service
// All Firestore CRUD operations for memberships and transactions

import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { MEMBERSHIP_STATUS } from "../constants";

// ============================================================
// REAL-TIME LISTENERS
// ============================================================

// LISTEN: Real-time listener for all transactions (admin)
export const subscribeToAllTransactions = (callback) => {
  const q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(transactions);
  });
};

// LISTEN: Real-time listener for user transactions
export const subscribeToUserTransactions = (userId, callback) => {
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(transactions);
  });
};

// LISTEN: Real-time listener for user's active/pending memberships
export const subscribeToUserMembershipStatus = (userId, callback) => {
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    where("status", "in", ["pending", "active"])
  );
  return onSnapshot(q, (snapshot) => {
    const memberships = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(memberships);
  });
};

// ============================================================
// MEMBERSHIP PLANS CRUD
// ============================================================

// CREATE: Add a new membership plan (admin only)
export const createMembershipPlan = async (planData) => {
  try {
    const docRef = await addDoc(collection(db, "memberships"), {
      ...planData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// READ: Get all membership plans
export const getMembershipPlans = async () => {
  try {
    const q = query(collection(db, "memberships"), orderBy("price", "asc"));
    const snapshot = await getDocs(q);
    const plans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, plans };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// READ: Get single membership plan
export const getMembershipPlan = async (planId) => {
  try {
    const docSnap = await getDoc(doc(db, "memberships", planId));
    if (docSnap.exists()) {
      return { success: true, plan: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: "Plan not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE: Edit a membership plan (admin only)
export const updateMembershipPlan = async (planId, updates) => {
  try {
    await updateDoc(doc(db, "memberships", planId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// DELETE: Remove a membership plan (admin only)
export const deleteMembershipPlan = async (planId) => {
  try {
    await deleteDoc(doc(db, "memberships", planId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================
// TRANSACTIONS CRUD - WITH SPAM PREVENTION
// ============================================================

// CHECK: Verify user doesn't have pending/active membership
export const checkUserMembershipConflict = async (userId) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("status", "in", ["pending", "active"])
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      const existing = snapshot.docs[0].data();
      return {
        hasConflict: true,
        existingStatus: existing.status,
        planTitle: existing.planTitle,
        message: `You already have a ${existing.status} membership (${existing.planTitle}). Please wait for approval or cancel before requesting a new one.`
      };
    }
    
    return { hasConflict: false };
  } catch (error) {
    console.error("Error checking membership conflict:", error);
    return { hasConflict: false };
  }
};

// CREATE: Purchase a membership (creates transaction) - WITH SPAM CHECK (atomic via transaction)
export const purchaseMembership = async (userId, planId, planData) => {
  try {
    const txId = await runTransaction(db, async (t) => {
      const userRef = doc(db, "users", userId);
      const userSnap = await t.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      const userDoc = userSnap.data();
      // Respect business rules: pending or active blocks new requests
      if (
        userDoc.membershipStatus === MEMBERSHIP_STATUS.PENDING ||
        userDoc.membershipStatus === MEMBERSHIP_STATUS.ACTIVE
      ) {
        throw new Error(
          `You already have a ${userDoc.membershipStatus} membership. Please wait or cancel before requesting a new one.`
        );
      }

      // Compute expiration
      const now = new Date();
      let expirationDate = new Date(now);

      // If this is a testing plan (1 minute), set expiration to 1 minute from now
      if (planData.isTestingPlan) {
        expirationDate.setMinutes(expirationDate.getMinutes() + 1);
      } else {
        // Otherwise, treat duration as days
        expirationDate.setDate(expirationDate.getDate() + (planData.duration || 0));
      }

      const expirationTimestamp = Timestamp.fromDate(expirationDate);

      // Prepare transaction doc (use a generated doc ref so we can set in transaction)
      const txRef = doc(collection(db, "transactions"));
      const txData = {
        userId,
        planId,
        planTitle: planData.title,
        planDuration: planData.duration,
        price: planData.price,
        status: MEMBERSHIP_STATUS.PENDING,
        purchaseDate: serverTimestamp(),
        expirationDate: expirationTimestamp,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Write transaction and update user document atomically
      t.set(txRef, txData);
      t.update(userRef, {
        membershipStatus: MEMBERSHIP_STATUS.PENDING,
        updatedAt: serverTimestamp(),
      });

      return txRef.id;
    });

    return { success: true, transactionId: txId };
  } catch (error) {
    // If conflict message was thrown in transaction, surface it cleanly
    return { success: false, error: error.message };
  }
};

// READ: Get all transactions for a user
export const getUserTransactions = async (userId) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, transactions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// READ: Get ALL transactions (admin only)
export const getAllTransactions = async () => {
  try {
    const q = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, transactions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE: Approve membership (admin activates it)
export const approveMembership = async (transactionId, userId, expirationDate) => {
  try {
    // Update transaction status
    await updateDoc(doc(db, "transactions", transactionId), {
      status: MEMBERSHIP_STATUS.ACTIVE,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update user's active membership
    await updateDoc(doc(db, "users", userId), {
      activeMembershipId: transactionId,
      membershipStatus: MEMBERSHIP_STATUS.ACTIVE,
      membershipExpiry: expirationDate,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE: Reject membership (admin rejects it) - keeps transaction record
export const rejectMembership = async (transactionId, userId) => {
  try {
    // Mark transaction as rejected (don't delete - keep for history)
    await updateDoc(doc(db, "transactions", transactionId), {
      status: MEMBERSHIP_STATUS.REJECTED,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Reset user's membership status so they can request again
    if (userId) {
      await updateDoc(doc(db, "users", userId), {
        membershipStatus: "none",
        activeMembershipId: null,
        membershipExpiry: null,
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE: Extend membership
export const extendMembership = async (transactionId, userId, additionalDays, currentExpiry) => {
  try {
    const currentDate = currentExpiry?.toDate ? currentExpiry.toDate() : new Date(currentExpiry);
    const newExpiry = new Date(currentDate);
    newExpiry.setDate(newExpiry.getDate() + additionalDays);
    const newExpiryTimestamp = Timestamp.fromDate(newExpiry);

    await updateDoc(doc(db, "transactions", transactionId), {
      expirationDate: newExpiryTimestamp,
      extended: true,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "users", userId), {
      membershipExpiry: newExpiryTimestamp,
      updatedAt: serverTimestamp(),
    });

    return { success: true, newExpiry };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// DELETE: Delete a transaction (admin only)
export const deleteTransaction = async (transactionId) => {
  try {
    await deleteDoc(doc(db, "transactions", transactionId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// DELETE: Mark transaction as expired and user as inactive (keeps transaction record)
export const deleteTransactionAndMarkExpired = async (transactionId, userId) => {
  try {
    // Mark transaction as expired (don't delete - keep for history)
    await updateDoc(doc(db, "transactions", transactionId), {
      status: MEMBERSHIP_STATUS.EXPIRED,
      deletedByAdmin: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Mark user as inactive
    if (userId) {
      await updateDoc(doc(db, "users", userId), {
        membershipStatus: "inactive",
        activeMembershipId: null,
        membershipExpiry: null,
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================
// AUTO-EXPIRATION CHECK
// ============================================================

// CHECK & UPDATE: Auto-expire memberships
export const checkAndUpdateExpiredMemberships = async () => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("status", "==", MEMBERSHIP_STATUS.ACTIVE)
    );
    const snapshot = await getDocs(q);
    const now = new Date();

    for (const docSnapshot of snapshot.docs) {
      const tx = docSnapshot.data();
      const expiryDate = tx.expirationDate?.toDate ? tx.expirationDate.toDate() : new Date(tx.expirationDate);
      
      if (expiryDate < now) {
        // Expire this membership
        await updateDoc(doc(db, "transactions", docSnapshot.id), {
          status: MEMBERSHIP_STATUS.EXPIRED,
          updatedAt: serverTimestamp(),
        });

        // Update user status and clear active membership
        if (tx.userId) {
          await updateDoc(doc(db, "users", tx.userId), {
            membershipStatus: MEMBERSHIP_STATUS.EXPIRED,
            activeMembershipId: null,
            // keep membershipExpiry for record
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error auto-expiring memberships:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// USER MANAGEMENT (Admin)
// ============================================================

// READ: Get all users with their membership status
export const getAllUsersWithStatus = async () => {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// DELETE: Delete user record completely (admin)
export const deleteUser = async (userId) => {
  try {
    // Delete user document from Firestore
    await deleteDoc(doc(db, "users", userId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// UPDATE: Edit user profile (admin) - updates Firestore user document fields
export const updateUser = async (userId, updates) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================
// UTILITY: Calculate days remaining
// ============================================================
export const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return 0;
  const expiry = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate);
  const now = new Date();
  const diff = expiry - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ============================================================
// UTILITY: Calculate time remaining (hours, minutes, seconds)
// ============================================================
export const getTimeRemaining = (expiryDate) => {
  if (!expiryDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const expiry = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate);
  const now = new Date();
  const diff = expiry - now;
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, expired: false };
};

// ============================================================
// UTILITY: Format date nicely (robust)
// ============================================================
export const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (err) {
    return "N/A";
  }
};

// ============================================================
// UTILITY: Format time nicely (robust)
// ============================================================
export const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (err) {
    return "N/A";
  }
};

// ============================================================
// REAL-TIME: Subscribe to all users (admin)
// ============================================================
export const subscribeToAllUsers = (callback) => {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(users);
  });
};