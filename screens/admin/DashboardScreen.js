// BAKAL GYM - Dashboard Screen
// Main screen after successful login - shows user or admin content based on role

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  GymLogo,
  PrimaryButton,
  Card,
  StatCard,
  SectionHeader,
  PhilippinesClock,
  MembershipCountdown,
} from "../../components/index";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants";
import { subscribeToUserMembershipStatus } from "../../services/MembershipService";
import AdminDashboardScreen from "./AdminDashboardScreen";

const DashboardScreen = ({ navigation }) => {
  const { user, userData, logout, isAdmin } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userMemberships, setUserMemberships] = useState([]);
  const unsubscribeRef = React.useRef(null);

  useEffect(() => {
    // For users, set up real-time listener for membership status
    if (user && !isAdmin) {
      unsubscribeRef.current = subscribeToUserMembershipStatus(user.uid, (memberships) => {
        setUserMemberships(memberships);
      });
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, isAdmin]);

  // If user is admin, show admin dashboard
  if (isAdmin) {
    return <AdminDashboardScreen navigation={navigation} />;
  }

  const hasActiveMembership = userMemberships.some((m) => m.status === "active");
  const hasPendingMembership = userMemberships.some((m) => m.status === "pending");
  const activeMembership = userMemberships.find((m) => m.status === "active");

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
        Alert.alert("Error", result.error || "Failed to logout. Please try again.");
        setLoggingOut(false);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while logging out.");
      setLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutModalVisible(false);
  };

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleLogoutCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.modalHeader}
            >
              <Ionicons name="log-out-outline" size={32} color={COLORS.black} />
            </LinearGradient>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to log out from Bakal Gym? You'll need to log in again to access your account.
              </Text>
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={handleLogoutCancel}
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
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Philippines Clock */}
        <PhilippinesClock />

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back,{" "}
            <Text style={styles.welcomeName}>
              {userData?.displayName || user?.email?.split("@")[0] || "User"}
            </Text>
          </Text>
          <Text style={styles.roleBadge}>MEMBER</Text>
        </View>

        {/* Membership Status Alert */}
        {hasPendingMembership && (
          <Card style={styles.statusAlert}>
            <Ionicons name="information-circle" size={24} color={COLORS.warning} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Pending Approval</Text>
              <Text style={styles.alertText}>
                Your membership request is waiting for admin approval
              </Text>
            </View>
          </Card>
        )}

        {/* Active Membership Card */}
        {hasActiveMembership && activeMembership && (
          <Card style={styles.activeMembershipCard}>
            <View style={styles.activeMembershipHeader}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={32}
                color={COLORS.success}
              />
              <View style={styles.activeMembershipInfo}>
                <Text style={styles.activeMembershipTitle}>
                  {activeMembership.planTitle}
                </Text>
                <Text style={styles.activeMembershipStatus}>ACTIVE</Text>
              </View>
            </View>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>Time Remaining:</Text>
              <MembershipCountdown expirationDate={activeMembership.expirationDate} />
            </View>
          </Card>
        )}

        {/* Stats Section */}
        <SectionHeader title="Overview" />
        <View style={styles.statsRow}>
          <StatCard
            icon={<MaterialCommunityIcons name="dumbbell" size={24} color={COLORS.primary} />}
            value={hasActiveMembership ? "Active" : "Inactive"}
            label="Membership"
            color={hasActiveMembership ? COLORS.success : COLORS.textMuted}
          />
          <StatCard
            icon={<Ionicons name="calendar-outline" size={24} color={COLORS.warning} />}
            value={activeMembership ? "Valid" : "None"}
            label="Status"
            color={COLORS.warning}
          />
        </View>

        {/* Account Info Card */}
        <SectionHeader title="Account Info" />
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Display Name</Text>
              <Text style={styles.infoValue}>
                {userData?.displayName || "Not set"}
              </Text>
            </View>
          </View>
          {userData?.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userData.phone}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Membership")}>
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.actionIcon}
            >
              <MaterialCommunityIcons name="dumbbell" size={24} color={COLORS.black} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Memberships</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Transactions")}>
            <LinearGradient
              colors={["#00B0FF", "#0081CB"]}
              style={styles.actionIcon}
            >
              <Ionicons name="receipt-outline" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Settings")}>
            <LinearGradient
              colors={["#FF1744", "#C51162"]}
              style={styles.actionIcon}
            >
              <Ionicons name="settings-outline" size={24} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerRight: {
    flexDirection: "row",
    gap: SPACING.md,
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
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    marginBottom: SPACING.xs,
  },
  welcomeName: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
  },
  roleBadge: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  statusAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.warning}11`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: COLORS.warning,
    fontSize: FONTS.sizes.base,
    fontWeight: "700",
  },
  alertText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  activeMembershipCard: {
    backgroundColor: `${COLORS.success}11`,
    borderWidth: 2,
    borderColor: `${COLORS.success}44`,
    marginBottom: SPACING.xl,
  },
  activeMembershipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  activeMembershipInfo: {
    flex: 1,
  },
  activeMembershipTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
  },
  activeMembershipStatus: {
    color: COLORS.success,
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },
  countdownContainer: {
    alignItems: "center",
    paddingVertical: SPACING.md,
    backgroundColor: `${COLORS.success}22`,
    borderRadius: RADIUS.lg,
  },
  countdownLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  infoCard: {
    marginBottom: SPACING.xl,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.base,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  actionCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    textAlign: "center",
  },
  // Logout Modal Styles
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
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default DashboardScreen;
