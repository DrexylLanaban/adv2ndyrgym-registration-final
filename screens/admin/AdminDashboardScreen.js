// BAKAL GYM - Admin Dashboard Screen
// Real-time admin management panel with Firestore listeners

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  GymLogo,
  PrimaryButton,
  SecondaryButton,
  Card,
  SectionHeader,
  StatusBadge,
  EmptyState,
  PhilippinesClock,
  MembershipCountdown,
} from "../../components/index";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants";
import {
  subscribeToAllTransactions,
  subscribeToAllUsers,
  getAllUsersWithStatus,
  approveMembership,
  rejectMembership,
  deleteTransactionAndMarkExpired,
  deleteUser,
  updateUser,
  formatDate,
  checkAndUpdateExpiredMemberships,
} from "../../services/MembershipService";

const AdminDashboardScreen = ({ navigation }) => {
  const { user, logout, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject' or 'delete'
  const [processing, setProcessing] = useState(false);
  const [usersModalVisible, setUsersModalVisible] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [userDeleteConfirmVisible, setUserDeleteConfirmVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [transactionsSearchQuery, setTransactionsSearchQuery] = useState("");
  const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false);
  const [selectedTxForRemoval, setSelectedTxForRemoval] = useState(null);
  // New states for user info & editing
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [userForm, setUserForm] = useState({ displayName: "", email: "", phone: "", role: "", membershipStatus: "" });
  const [savingUser, setSavingUser] = useState(false);
  const unsubscribeRef = React.useRef(null);
  const usersUnsubscribeRef = React.useRef(null);

  useEffect(() => {
    if (!isAdmin) return;

    // Set up real-time listener for transactions
    unsubscribeRef.current = subscribeToAllTransactions((txs) => {
      setTransactions(txs);
      setLoading(false);
    });

    // Set up real-time listener for users so admin sees status changes immediately
    usersUnsubscribeRef.current = subscribeToAllUsers((usrs) => {
      setUsers(usrs.filter((u) => u.role !== "admin"));
    });

    // Auto-expire memberships every 5 seconds
    const expirationInterval = setInterval(async () => {
      await checkAndUpdateExpiredMemberships();
    }, 5000);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (usersUnsubscribeRef.current) {
        usersUnsubscribeRef.current();
      }
      clearInterval(expirationInterval);
    };
  }, [isAdmin]);



  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await checkAndUpdateExpiredMemberships();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper: format owner label for admin lists
  const getUserLabel = (userId) => {
    const u = users.find((x) => x.id === userId) || users.find((x) => x.uid === userId);
    if (!u) return "Unknown";
    if (u.displayName && u.email) return `${u.displayName} • ${u.email}`;
    return u.displayName || u.email || "Unknown";
  };

  const handleApprove = (transaction) => {
    setSelectedTransaction(transaction);
    setActionType("approve");
    setActionModalVisible(true);
  };

  const handleReject = (transaction) => {
    setSelectedTransaction(transaction);
    setActionType("reject");
    setActionModalVisible(true);
  };

  const handleDelete = (transaction) => {
    setSelectedTxForRemoval(transaction);
    setRemoveConfirmVisible(true);
  };

  const confirmRemovalAndDelete = async () => {
    if (!selectedTxForRemoval) return;
    setProcessing(true);
    try {
      const result = await deleteTransactionAndMarkExpired(
        selectedTxForRemoval.id,
        selectedTxForRemoval.userId
      );
      if (result.success) {
        Alert.alert("✓ Success", "Membership removed and user marked as inactive.");
        setRemoveConfirmVisible(false);
        setSelectedTxForRemoval(null);
      } else {
        Alert.alert("Error", result.error || "Failed to remove membership");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred");
      console.error("Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const showDetails = (tx) => {
    setSelectedDetails(tx);
    setDetailsModalVisible(true);
  };

  const confirmAction = async () => {
    if (!selectedTransaction) return;

    setProcessing(true);
    try {
      if (actionType === "approve") {
        const result = await approveMembership(
          selectedTransaction.id,
          selectedTransaction.userId,
          selectedTransaction.expirationDate
        );

        if (result.success) {
          Alert.alert("✓ Success", "Membership approved successfully!");
          setActionModalVisible(false);
          setSelectedTransaction(null);
        } else {
          Alert.alert("Error", result.error || "Failed to approve membership");
        }
      } else if (actionType === "reject") {
        const result = await rejectMembership(
          selectedTransaction.id,
          selectedTransaction.userId
        );

        if (result.success) {
          Alert.alert("✓ Success", "Membership rejected. User can request again.");
          setActionModalVisible(false);
          setSelectedTransaction(null);
        } else {
          Alert.alert("Error", result.error || "Failed to reject membership");
        }
      } else if (actionType === "delete") {
        const result = await deleteTransactionAndMarkExpired(
          selectedTransaction.id,
          selectedTransaction.userId
        );

        if (result.success) {
          Alert.alert("✓ Success", "Membership marked as expired. User is now inactive.");
          setActionModalVisible(false);
          setSelectedTransaction(null);
        } else {
          Alert.alert("Error", result.error || "Failed to delete membership");
        }
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred");
      console.error("Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      const result = await logout();
      if (result.success) {
        setLogoutModalVisible(false);
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else {
        Alert.alert("Error", result.error || "Failed to logout");
        setLoggingOut(false);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while logging out");
      setLoggingOut(false);
    }
  };

  const getPendingCount = () => transactions.filter((t) => t.status === "pending").length;
  const getActiveCount = () => transactions.filter((t) => t.status === "active").length;
  const getTotalRevenue = () =>
    transactions
      .filter((t) => t.status === "active")
      .reduce((sum, t) => sum + (t.price || 0), 0);

  const getFilteredUsers = () => {
    return users.filter((u) => {
      // Apply status filter
      if (statusFilter === 'active' && u.membershipStatus !== 'active') return false;
      if (statusFilter === 'inactive' && u.membershipStatus !== 'inactive') return false;
      if (statusFilter === 'expired' && u.membershipStatus !== 'expired') return false;

      // Apply search query filter
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const name = (u.displayName || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      }

      return true;
    });
  };

  const handleDeleteUser = (user) => {
    setSelectedUserForDelete(user);
    setUserDeleteConfirmVisible(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    setProcessing(true);
    try {
      const result = await deleteUser(selectedUserForDelete.id);
      if (result.success) {
        Alert.alert("✓ Success", "User deleted successfully.");
        setUserDeleteConfirmVisible(false);
        setSelectedUserForDelete(null);
      } else {
        Alert.alert("Error", result.error || "Failed to delete user");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred");
      console.error("Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Open user info modal for viewing/updating
  const openUserInfoModal = (user) => {
    setSelectedUser(user);
    setUserForm({
      displayName: user.displayName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
      membershipStatus: user.membershipStatus || "",
    });
    setEditingUser(false);
    setUserInfoModalVisible(true);
  };

  const handleUserFormChange = (key, value) => setUserForm((p) => ({ ...p, [key]: value }));

  const saveUserUpdates = async () => {
    if (!selectedUser) return;
    setSavingUser(true);
    try {
      const result = await updateUser(selectedUser.id, userForm);
      if (result.success) {
        Alert.alert("✓ Success", "User updated.");
        setUserInfoModalVisible(false);
        setSelectedUser(null);
      } else {
        Alert.alert("Error", result.error || "Failed to update user");
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred");
      console.error(err);
    } finally {
      setSavingUser(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      {/* Logout Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.modalHeader}
            >
              <Ionicons name="log-out-outline" size={32} color={COLORS.black} />
            </LinearGradient>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => setLogoutModalVisible(false)}
                disabled={loggingOut}
              >
                <Text style={styles.buttonCancelText}>STAY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonLogout, loggingOut && styles.buttonDisabled]}
                onPress={handleLogoutConfirm}
                disabled={loggingOut}
              >
                <Text style={styles.buttonLogoutText}>
                  {loggingOut ? "LOGGING OUT..." : "LOGOUT"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Action Modal (Approve/Reject) */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={
                actionType === "approve"
                  ? COLORS.gradientPrimary
                  : ["#FF1744", "#C51162"]
              }
              style={styles.modalHeader}
            >
              <Ionicons
                name={
                  actionType === "approve"
                    ? "checkmark-circle"
                    : actionType === "reject"
                    ? "close-circle"
                    : "trash-outline"
                }
                size={32}
                color={COLORS.black}
              />
            </LinearGradient>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {actionType === "approve"
                  ? "Approve Membership?"
                  : actionType === "reject"
                  ? "Reject Membership?"
                  : "Delete Membership?"}
              </Text>
              {selectedTransaction && (
                <View style={styles.txDetailsModal}>
                  <Text style={styles.detailLabel}>Plan:</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.planTitle}</Text>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>₱{selectedTransaction.price}</Text>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.planDuration} days</Text>
                </View>
              )}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => setActionModalVisible(false)}
                disabled={processing}
              >
                <Text style={styles.buttonCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  actionType === "approve"
                    ? styles.buttonApprove
                    : actionType === "delete"
                    ? styles.buttonDelete
                    : styles.buttonReject,
                  processing && styles.buttonDisabled,
                ]}
                onPress={confirmAction}
                disabled={processing}
              >
                <Text style={styles.buttonActionText}>
                  {processing
                    ? "PROCESSING..."
                    : actionType === "approve"
                    ? "APPROVE"
                    : actionType === "delete"
                    ? "DELETE"
                    : "REJECT"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* User Delete Confirmation Modal */}
      <Modal
        visible={userDeleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#FF1744", "#C51162"]}
              style={styles.modalHeader}
            >
              <Ionicons name="warning" size={32} color={COLORS.black} />
            </LinearGradient>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete User?</Text>
              {selectedUserForDelete && (
                <View style={styles.txDetailsModal}>
                  <Text style={styles.detailLabel}>User:</Text>
                  <Text style={styles.detailValue}>
                    {selectedUserForDelete.displayName || selectedUserForDelete.email}
                  </Text>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedUserForDelete.email}</Text>
                  <Text style={[styles.detailLabel, { color: COLORS.danger, marginTop: SPACING.md }]}>
                    ⚠ This will permanently delete the user account.
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => setUserDeleteConfirmVisible(false)}
                disabled={processing}
              >
                <Text style={styles.buttonCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonReject, processing && styles.buttonDisabled]}
                onPress={confirmDeleteUser}
                disabled={processing}
              >
                <Text style={styles.buttonActionText}>
                  {processing ? "DELETING..." : "DELETE USER"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove Membership Confirmation Modal */}
      <Modal
        visible={removeConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRemoveConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#FF1744", "#C51162"]}
              style={styles.modalHeader}
            >
              <Ionicons name="trash-outline" size={32} color={COLORS.black} />
            </LinearGradient>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Remove Membership?</Text>
              {selectedTxForRemoval && (
                <View style={styles.txDetailsModal}>
                  <Text style={styles.detailLabel}>User:</Text>
                  <Text style={styles.detailValue}>{getUserLabel(selectedTxForRemoval.userId)}</Text>
                  <Text style={styles.detailLabel}>Plan:</Text>
                  <Text style={styles.detailValue}>{selectedTxForRemoval.planTitle}</Text>
                  <Text style={styles.detailLabel}>Expiry:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedTxForRemoval.expirationDate)}</Text>
                  <Text style={[styles.detailLabel, { color: COLORS.warning, marginTop: SPACING.md }]}>
                    ⚠ This will mark the membership as expired and user as inactive.
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => setRemoveConfirmVisible(false)}
                disabled={processing}
              >
                <Text style={styles.buttonCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonReject, processing && styles.buttonDisabled]}
                onPress={confirmRemovalAndDelete}
                disabled={processing}
              >
                <Text style={styles.buttonActionText}>
                  {processing ? "REMOVING..." : "REMOVE"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
          <View style={styles.header}>
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.headerBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Membership Details</Text>
              <View style={{ width: 40 }} />
            </View>
          </View>

          {selectedDetails && (
            <ScrollView contentContainerStyle={styles.scroll}>
              <Card style={styles.detailsCard}>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Member</Text>
                  <Text style={styles.detailsValue}>{getUserLabel(selectedDetails.userId)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Plan</Text>
                  <Text style={styles.detailsValue}>{selectedDetails.planTitle}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Status</Text>
                  <StatusBadge status={selectedDetails.status} />
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Duration</Text>
                  <Text style={styles.detailsValue}>{selectedDetails.planDuration} Days</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Price</Text>
                  <Text style={styles.detailsValue}>₱{selectedDetails.price}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Purchase Date</Text>
                  <Text style={styles.detailsValue}>{formatDate(selectedDetails.purchaseDate)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Expiration Date</Text>
                  <Text style={styles.detailsValue}>
                    {selectedDetails.expirationDate ? formatDate(selectedDetails.expirationDate) : "N/A"}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Transaction ID</Text>
                  <Text style={[styles.detailsValue, { fontSize: FONTS.sizes.xs }]}>
                    {selectedDetails.id}
                  </Text>
                </View>
              </Card>
            </ScrollView>
          )}
        </LinearGradient>
      </Modal>

      {/* User Delete Confirmation Modal */}
      <Modal
        visible={userDeleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#FF1744", "#C51162"]}
              style={styles.modalHeader}
            >
              <Ionicons name="warning" size={32} color={COLORS.black} />
            </LinearGradient>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete User?</Text>
              {selectedUserForDelete && (
                <View style={styles.txDetailsModal}>
                  <Text style={styles.detailLabel}>User:</Text>
                  <Text style={styles.detailValue}>
                    {selectedUserForDelete.displayName || selectedUserForDelete.email}
                  </Text>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedUserForDelete.email}</Text>
                  <Text style={[styles.detailLabel, { color: COLORS.danger, marginTop: SPACING.md }]}>
                    ⚠ This will permanently delete the user account.
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => setUserDeleteConfirmVisible(false)}
                disabled={processing}
              >
                <Text style={styles.buttonCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonReject, processing && styles.buttonDisabled]}
                onPress={confirmDeleteUser}
                disabled={processing}
              >
                <Text style={styles.buttonActionText}>
                  {processing ? "DELETING..." : "DELETE USER"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Users Modal */}
      <Modal
        visible={usersModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUsersModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { width: '95%', height: '85%' }]}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.modalHeader}>
              <MaterialCommunityIcons name="account-multiple" size={32} color={COLORS.black} />
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={styles.modalBodyHeader}>
                <Text style={styles.modalTitle}>All Registered Users</Text>
                <TouchableOpacity onPress={() => setUsersModalVisible(false)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>CLOSE</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalSearchWrap}>
                <TextInput
                  placeholder="Search name or email"
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
                <View style={styles.filterRow}>
                  {['all','active','inactive','expired'].map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.filterButton, statusFilter === f && styles.filterButtonActive]}
                      onPress={() => setStatusFilter(f)}
                    >
                      <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>{f.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <ScrollView style={styles.usersScroll} contentContainerStyle={{ padding: SPACING.md }}>
                <SectionHeader title="Users" />
                {getFilteredUsers().length === 0 ? (
                  <EmptyState title="No users found" />
                ) : (
                  getFilteredUsers().map((u) => (
                    <TouchableOpacity key={u.id} onPress={() => openUserInfoModal(u)} activeOpacity={0.8}>
                      <Card style={{ marginBottom: SPACING.sm }}>
                        <View style={styles.userItemRow}>
                          <View style={styles.userItemIcon}>
                            <Ionicons name="person-circle" size={24} color={COLORS.primary} />
                          </View>
                          <View style={styles.userItemContent}>
                            <Text style={styles.userItemName}>{u.displayName || u.email}</Text>
                            <Text style={styles.userItemEmail}>{u.email}</Text>
                            <Text style={styles.userItemStatus}>{u.membershipStatus || 'none'}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                            <Text style={{ color: COLORS.textSecondary }}>{u.membershipExpiry ? formatDate(u.membershipExpiry) : '—'}</Text>
                            <TouchableOpacity style={styles.userDeleteBtn} onPress={() => handleDeleteUser(u)}>
                              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))
                )}


              </ScrollView>

            </View>
          </View>
        </View>
      </Modal>

      {/* User Info Modal */}
      <Modal
        visible={userInfoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUserInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { width: '90%' }]}>
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.modalHeader}>
              <Ionicons name="person-circle" size={32} color={COLORS.black} />
            </LinearGradient>

            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingUser ? "Edit User" : "User Info"}</Text>

              {selectedUser && (
                <View style={{ marginTop: SPACING.md }}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <TextInput
                    value={userForm.displayName}
                    onChangeText={(v) => handleUserFormChange('displayName', v)}
                    style={styles.searchInput}
                    editable={editingUser}
                    placeholder="Display name"
                    placeholderTextColor={COLORS.textMuted}
                  />

                  <Text style={styles.detailLabel}>Email</Text>
                  <TextInput
                    value={userForm.email}
                    onChangeText={(v) => handleUserFormChange('email', v)}
                    style={styles.searchInput}
                    editable={editingUser}
                    placeholder="Email (Firestore only)"
                    placeholderTextColor={COLORS.textMuted}
                  />

                  <Text style={styles.detailLabel}>Phone</Text>
                  <TextInput
                    value={userForm.phone}
                    onChangeText={(v) => handleUserFormChange('phone', v)}
                    style={styles.searchInput}
                    editable={editingUser}
                    placeholder="Phone"
                    placeholderTextColor={COLORS.textMuted}
                  />

                  <Text style={styles.detailLabel}>Role</Text>
                  <TextInput
                    value={userForm.role}
                    onChangeText={(v) => handleUserFormChange('role', v)}
                    style={styles.searchInput}
                    editable={editingUser}
                    placeholder="Role"
                    placeholderTextColor={COLORS.textMuted}
                  />

                  <Text style={styles.detailLabel}>Membership Status</Text>
                  <TextInput
                    value={userForm.membershipStatus}
                    onChangeText={(v) => handleUserFormChange('membershipStatus', v)}
                    style={styles.searchInput}
                    editable={editingUser}
                    placeholder="Membership status"
                    placeholderTextColor={COLORS.textMuted}
                  />

                  <Text style={{ color: COLORS.textSecondary, marginTop: SPACING.sm, fontSize: FONTS.sizes.xs }}>
                    Note: Changing email only updates Firestore user record, not Firebase Auth email.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => {
                  if (editingUser) {
                    setEditingUser(false);
                    setUserForm({ displayName: selectedUser?.displayName || '', email: selectedUser?.email || '', phone: selectedUser?.phone || '', role: selectedUser?.role || '', membershipStatus: selectedUser?.membershipStatus || '' });
                  } else {
                    setUserInfoModalVisible(false);
                    setSelectedUser(null);
                  }
                }}
              >
                <Text style={styles.buttonCancelText}>{editingUser ? 'CANCEL' : 'CLOSE'}</Text>
              </TouchableOpacity>

              {editingUser ? (
                <TouchableOpacity style={[styles.buttonApprove, savingUser && styles.buttonDisabled]} onPress={saveUserUpdates} disabled={savingUser}>
                  <Text style={styles.buttonActionText}>{savingUser ? 'SAVING...' : 'SAVE'}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.buttonApprove]} onPress={() => setEditingUser(true)}>
                  <Text style={styles.buttonActionText}>EDIT</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.headerBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={styles.headerContent}>
          <GymLogo size="sm" showText={false} />
          <Text style={styles.adminLabel}>ADMIN</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: SPACING.sm}}>
            <TouchableOpacity onPress={() => setUsersModalVisible(true)} style={[styles.logoutBtn, { marginRight: SPACING.md, backgroundColor: `${COLORS.primary}22` }]}>
              <MaterialCommunityIcons name="account-multiple" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Philippines Clock */}
        <PhilippinesClock />

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Admin Panel</Text>
          <Text style={styles.subtitle}>Membership management</Text>


        </View>

        {/* Stats Section */}
        <SectionHeader title="Overview" />
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <MaterialCommunityIcons
              name="clock-alert"
              size={28}
              color={COLORS.warning}
            />
            <Text style={styles.statValue}>{getPendingCount()}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
          <Card style={styles.statCard}>
            <MaterialCommunityIcons
              name="check-circle"
              size={28}
              color={COLORS.success}
            />
            <Text style={styles.statValue}>{getActiveCount()}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </Card>
          <Card style={styles.statCard}>
            <MaterialCommunityIcons name="cash" size={28} color={COLORS.primary} />
            <Text style={[styles.statValue, { fontSize: 16 }]}>₱{getTotalRevenue()}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </Card>
        </View>

        {/* Pending Memberships */}
        <SectionHeader
          title="Pending Approvals"
          subtitle={`${getPendingCount()} awaiting action`}
        />
        {getPendingCount() === 0 ? (
          <EmptyState
            icon="checkmark-done"
            title="All Caught Up!"
            subtitle="No pending memberships"
          />
        ) : (
          <View style={styles.membershipsList}>
            {transactions
              .filter((t) => t.status === "pending")
              .map((tx) => (
                <Card key={tx.id} style={styles.txCard}>
                  <View style={styles.txHeader}>
                    <View style={styles.txIconBg}>
                      <MaterialCommunityIcons
                        name="dumbbell"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txTitle}>{tx.planTitle}</Text>
                      <Text style={styles.txSubtitle}>
                        {formatDate(tx.purchaseDate)}
                      </Text>
                      <Text style={styles.txOwner}>Owner: {getUserLabel(tx.userId)}</Text>
                    </View>
                    <Text style={styles.txPrice}>₱{tx.price}</Text>
                  </View>

                  <View style={styles.txButtons}>
                    <SecondaryButton
                      title="Reject"
                      onPress={() => handleReject(tx)}
                      color={COLORS.danger}
                      style={styles.btnReject}
                    />
                    <PrimaryButton
                      title="Approve"
                      onPress={() => handleApprove(tx)}
                      style={styles.btnApprove}
                    />
                  </View>
                </Card>
              ))}
          </View>
        )}

        {/* Active Memberships */}
        <SectionHeader title="Active Memberships" subtitle={`${getActiveCount()} members`} />
        {transactions.filter((t) => t.status === "active").length === 0 ? (
          <EmptyState icon="dumbbell" title="No Active Members" />
        ) : (
          <View style={styles.activesList}>
            {transactions
              .filter((t) => t.status === "active")
              .map((tx) => (
                <Card key={tx.id} style={styles.activeTxCard}>
                  <View style={styles.activeTxRow}>
                    <View style={styles.activeTxIcon}>
                      <MaterialCommunityIcons
                        name="dumbbell"
                        size={18}
                        color={COLORS.success}
                      />
                    </View>
                    <View style={styles.activeTxContent}>
                      <Text style={styles.activeTxTitle}>
                        {getUserLabel(tx.userId)} - {tx.planTitle}
                      </Text>
                      <Text style={styles.activeTxDate}>
                        Expires: {formatDate(tx.expirationDate)}
                      </Text>
                    </View>
                    <View style={styles.countdownBadge}>
                      <MembershipCountdown expirationDate={tx.expirationDate} compact />
                    </View>
                    <View style={styles.activeMembershipActions}>
                      <SecondaryButton
                        title="Details"
                        onPress={() => showDetails(tx)}
                        color={COLORS.info}
                        style={styles.btnDetails}
                      />
                      <SecondaryButton
                        title="Remove"
                        onPress={() => handleDelete(tx)}
                        color={COLORS.danger}
                        style={styles.btnDelete}
                      />
                    </View>
                  </View>
                </Card>
              ))}
          </View>
        )}

        {/* Recent Transactions */}
        <SectionHeader title="All Transactions" subtitle={`${transactions.length} total`} />
        
        {/* Transaction Search */}
        <View style={styles.searchContainerTransactions}>
          <Ionicons
            name="search"
            size={18}
            color={COLORS.textMuted}
            style={styles.searchIconSmall}
          />
          <TextInput
            style={styles.searchInputTransactions}
            placeholder="Search by name or email..."
            placeholderTextColor={COLORS.textMuted}
            value={transactionsSearchQuery}
            onChangeText={setTransactionsSearchQuery}
          />
          {transactionsSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setTransactionsSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete suggestions (starts-with match) */}
        {transactionsSearchQuery.length > 0 && (
          <View style={styles.searchSuggestions}>
            {users
              .filter((u) => {
                const label = ((u.displayName || u.email) || "").toLowerCase();
                return label.startsWith(transactionsSearchQuery.toLowerCase());
              })
              .slice(0, 8)
              .map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.suggestionItem}
                  onPress={() => setTransactionsSearchQuery(u.displayName || u.email)}
                >
                  <Text style={styles.suggestionText}>{u.displayName || u.email}</Text>
                  <Text style={styles.suggestionSub}>{u.email}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {transactions.length === 0 ? (
          <EmptyState icon="receipt" title="No Transactions" />
        ) : (
          <View style={styles.transactionsList}>
            {transactions
              .filter((tx) => {
                if (!transactionsSearchQuery) return true;
                const userLabel = getUserLabel(tx.userId);
                return userLabel.toLowerCase().includes(transactionsSearchQuery.toLowerCase());
              })
              .slice(0, 15)
              .map((tx) => (
                <Card key={tx.id} style={styles.txItem}>
                  <View style={styles.txItemRow}>
                    <View style={styles.txItemIcon}>
                      <Ionicons
                        name="receipt-outline"
                        size={18}
                        color={
                          tx.status === "active"
                            ? COLORS.success
                            : tx.status === "pending"
                            ? COLORS.warning
                            : COLORS.textMuted
                        }
                      />
                    </View>
                    <View style={styles.txItemContent}>
                      <Text style={styles.txItemTitle}>
                        {getUserLabel(tx.userId)} - {tx.planTitle}
                      </Text>
                      <Text style={styles.txItemDate}>
                        {formatDate(tx.purchaseDate)}
                      </Text>
                    </View>
                    <View style={styles.txItemActions}>
                      <StatusBadge status={tx.status} />
                      <SecondaryButton
                        title="View"
                        onPress={() => showDetails(tx)}
                        color={COLORS.info}
                        style={styles.btnViewSmall}
                      />
                      <SecondaryButton
                        title="Delete"
                        onPress={() => handleDelete(tx)}
                        color={COLORS.danger}
                        style={styles.btnDeleteSmall}
                      />
                    </View>
                  </View>
                </Card>
              ))}
          </View>
        )}


      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => setUsersModalVisible(true)}>
          <MaterialCommunityIcons name="account-multiple" size={20} color={COLORS.black} />
          <Text style={styles.fabText}>View All Users</Text>
        </TouchableOpacity>
      </View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.lg,
    textAlign: "center",
    marginTop: SPACING.xl,
  },
  header: {
    paddingTop: SPACING.xl,
  },
  headerBar: {
    height: 4,
    width: "100%",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  adminLabel: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
    letterSpacing: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    padding: SPACING.xl,
    paddingBottom: SPACING["3xl"],
  },
  welcomeSection: {
    marginBottom: SPACING.xl,
  },
  welcomeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes["3xl"],
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  searchContainer: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    height: 44,
    color: COLORS.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.card}`,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterButtonActive: {
    backgroundColor: `${COLORS.primary}22`,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  filterTextActive: {
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    flexWrap: "wrap",
  },
  statCard: {
    width: "31%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
  },
  statValue: {
    color: COLORS.primary,
    fontSize: FONTS.sizes["2xl"],
    fontWeight: "900",
    marginVertical: SPACING.xs,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    textAlign: "center",
    fontWeight: "600",
  },
  membershipsList: {
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  txCard: {
    marginBottom: 0,
  },
  txHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  txIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}22`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: "700",
  },
  txSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
  },
  txPrice: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
  },
  txButtons: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  btnReject: {
    flex: 1,
  },
  btnApprove: {
    flex: 1,
  },
  activesList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  activeTxCard: {
    marginBottom: 0,
  },
  activeTxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  activeTxIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.success}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTxContent: {
    flex: 1,
  },
  activeTxTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: "600",
  },
  activeTxDate: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
  countdownBadge: {
    backgroundColor: `${COLORS.primary}11`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  transactionsList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  txItem: {
    marginBottom: 0,
  },
  txItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  txItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  txItemContent: {
    flex: 1,
  },
  txItemTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: "600",
  },
  txItemDate: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
  txOwner: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
    marginTop: SPACING.xs,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalHeader: {
    paddingVertical: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  modalBody: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  modalBodyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.danger,
  },
  modalCloseText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  modalSearchWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  usersScroll: {
    flex: 1,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  modalMessage: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
    textAlign: "center",
  },
  txDetailsModal: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    marginTop: SPACING.sm,
  },
  detailValue: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
  },
  modalButtons: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  buttonCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancelText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
    letterSpacing: 1,
  },
  buttonLogout: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLogoutText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
    letterSpacing: 1,
  },
  buttonApprove: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonReject: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActionText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonDelete: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  usersList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  userItem: {
    marginBottom: 0,
  },
  userItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  userItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  userItemContent: {
    flex: 1,
  },
  userItemName: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: "600",
  },
  userItemEmail: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  userItemStatus: {
    color: COLORS.warning,
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    marginTop: 2,
  },
  userDeleteBtn: {
    padding: SPACING.sm,
  },
  /* details layout */
  detailsLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  detailsField: {
    paddingVertical: SPACING.sm,
  },
  detailsRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  searchContainerTransactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  searchIconSmall: {
    marginRight: SPACING.sm,
  },
  searchInputTransactions: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    height: 40,
    color: COLORS.textPrimary,
  },
  searchSuggestions: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  suggestionText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  suggestionSub: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
  },
  /* layout fixes */
  activeMembershipActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  btnDetails: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.info}22`,
    marginRight: SPACING.sm,
  },
  btnDelete: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.danger}22`,
  },
  txItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  btnViewSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.info}22`,
  },
  btnDeleteSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.danger}22`,
  },
  detailsValue: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    marginTop: SPACING.xs,
    flexWrap: 'wrap',
  },

});

export default AdminDashboardScreen;
