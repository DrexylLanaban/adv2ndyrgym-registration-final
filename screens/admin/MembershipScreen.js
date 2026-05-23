// BAKAL GYM - Membership Purchase Screen
// Users can purchase membership plans with receipt generation

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { GymLogo, PrimaryButton, Card, SectionHeader, StatusBadge } from "../../components/index";
import { COLORS, FONTS, SPACING, RADIUS, MEMBERSHIP_PLANS } from "../../constants";
import { purchaseMembership } from "../../services/MembershipService";

const MembershipScreen = ({ navigation }) => {
  const { user, userData } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handlePurchase = async (plan) => {
    if (loading) return;
    
    setSelectedPlan(plan);
    setLoading(true);

    try {
      // Check for existing pending/active memberships
      const result = await purchaseMembership(user.uid, plan.id, plan);
      
      if (result.success) {
        // Generate receipt data
        const receipt = {
          transactionId: result.transactionId,
          planTitle: plan.title,
          planDuration: plan.duration,
          price: plan.price,
          purchaseDate: new Date().toLocaleDateString(),
          email: user.email,
          status: "PENDING",
        };
        
        setReceiptData(receipt);
        setShowReceipt(true);
      } else {
        Alert.alert("Cannot Purchase", result.error || "Failed to purchase membership");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during purchase");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransactions = () => {
    setShowReceipt(false);
    navigation.navigate("Transactions");
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.headerBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Membership Plans</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Membership Status */}
        <SectionHeader title="Current Status" />
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>Membership Status</Text>
              <StatusBadge status={userData?.membershipStatus || "none"} />
            </View>
            {userData?.membershipExpiry && (
              <View style={styles.expiryContainer}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.expiryText}>
                  Expires: {new Date(userData.membershipExpiry).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Available Plans */}
        <SectionHeader title="Choose Your Plan" />
        <View style={styles.plansContainer}>
          {MEMBERSHIP_PLANS.map((plan) => (
            <Card
              key={plan.id}
              style={[styles.planCard, plan.popular && styles.popularCard]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
              </View>

              <View style={styles.planPrice}>
                <Text style={styles.planPriceLabel}>{plan.priceLabel}</Text>
                <Text style={styles.planDuration}>{plan.durationLabel}</Text>
              </View>

              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={plan.color} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <PrimaryButton
                title="Purchase Plan"
                onPress={() => handlePurchase(plan)}
                loading={loading && selectedPlan?.id === plan.id}
                disabled={loading}
                style={styles.purchaseBtn}
              />
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Receipt Modal */}
      <Modal
        visible={showReceipt}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseReceipt}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptCard}>
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.receiptHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="receipt" size={40} color={COLORS.black} />
              <Text style={styles.receiptTitle}>Purchase Receipt</Text>
            </LinearGradient>

            <ScrollView 
              style={styles.receiptContent}
              contentContainerStyle={{ justifyContent: 'flex-start' }}
            >
              <View style={styles.receiptSection}>
                <Text style={styles.receiptLabel}>Transaction ID</Text>
                <Text style={styles.receiptValue}>{receiptData?.transactionId}</Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptSection}>
                <Text style={styles.receiptLabel}>Plan</Text>
                <Text style={styles.receiptValue}>{receiptData?.planTitle}</Text>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.receiptLabel}>Duration</Text>
                <Text style={styles.receiptValue}>{receiptData?.planDuration} Days</Text>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.receiptLabel}>Price</Text>
                <Text style={styles.receiptValue}>₱{receiptData?.price}</Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptSection}>
                <Text style={styles.receiptLabel}>Date</Text>
                <Text style={styles.receiptValue}>{receiptData?.purchaseDate}</Text>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.receiptLabel}>Email</Text>
                <Text style={styles.receiptValue}>{receiptData?.email}</Text>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.receiptLabel}>Status</Text>
                <StatusBadge status={receiptData?.status || "pending"} />
              </View>

              <Text style={styles.receiptNote}>
                Your membership is pending approval. Please wait for admin confirmation.
              </Text>
            </ScrollView>

            <View style={styles.receiptActions}>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={handleViewTransactions}
              >
                <Text style={styles.smallBtnText}>View Transactions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallBtn, styles.smallBtnSecondary]}
                onPress={handleCloseReceipt}
              >
                <Text style={styles.smallBtnTextSecondary}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
  },
  scroll: {
    padding: SPACING.xl,
    paddingBottom: SPACING["3xl"],
  },
  statusCard: {
    marginBottom: SPACING.xl,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  expiryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  expiryText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  plansContainer: {
    gap: SPACING.lg,
  },
  planCard: {
    position: "relative",
  },
  popularCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  popularBadgeText: {
    color: COLORS.black,
    fontSize: FONTS.sizes.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },
  planHeader: {
    marginBottom: SPACING.md,
  },
  planTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xl,
    fontWeight: "800",
    marginBottom: SPACING.xs,
  },
  planSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  planPrice: {
    marginBottom: SPACING.lg,
  },
  planPriceLabel: {
    color: COLORS.primary,
    fontSize: FONTS.sizes["3xl"],
    fontWeight: "900",
    marginBottom: SPACING.xs,
  },
  planDuration: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  featuresList: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  featureText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
  },
  purchaseBtn: {
    marginTop: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  receiptCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    width: "100%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  receiptHeader: {
    padding: SPACING.xl,
    alignItems: "center",
    gap: SPACING.sm,
  },
  receiptTitle: {
    color: COLORS.black,
    fontSize: FONTS.sizes.lg,
    fontWeight: "800",
  },
  receiptContent: {
    padding: SPACING.xl,
    flex: 1,
  },
  receiptSection: {
    marginBottom: SPACING.md,
  },
  receiptLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    marginBottom: 4,
  },
  receiptValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.base,
    fontWeight: "600",
  },
  receiptDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.md,
  },
  receiptNote: {
    color: COLORS.warning,
    fontSize: FONTS.sizes.sm,
    textAlign: "center",
    marginTop: SPACING.lg,
    lineHeight: 20,
  },
  receiptActions: {
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    flexDirection: "row",
  },
  receiptBtn: {
    marginBottom: 0,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnSecondary: {
    backgroundColor: `${COLORS.primary}44`,
  },
  smallBtnText: {
    color: COLORS.black,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
  },
  smallBtnTextSecondary: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
  },
});

export default MembershipScreen;
