// BAKAL GYM - Transactions Screen
// Display purchase history for users and admins

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { GymLogo, Card, SectionHeader, StatusBadge, EmptyState, MembershipCountdown } from "../../components/index";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants";
import { subscribeToUserTransactions, subscribeToAllTransactions, getAllUsersWithStatus, formatDate } from "../../services/MembershipService";

const TransactionsScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const unsubscribeRef = React.useRef(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    if (isAdmin) {
      // Admin: subscribe to ALL transactions in realtime
      unsubscribeRef.current = subscribeToAllTransactions((txs) => {
        setTransactions(txs);
        setLoading(false);
      });
      // Load users for display
      loadUsers();
    } else {
      // User: subscribe to own transactions in realtime
      unsubscribeRef.current = subscribeToUserTransactions(user.uid, (txs) => {
        setTransactions(txs);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, isAdmin]);

  const loadUsers = async () => {
    try {
      const result = await getAllUsersWithStatus();
      if (result.success) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (isAdmin) {
      await loadUsers();
    }
    setRefreshing(false);
  };

  const getUserLabel = (userId) => {
    const u = users.find((x) => x.id === userId) || users.find((x) => x.uid === userId);
    if (!u) return "Unknown";
    if (u.displayName && u.email) return `${u.displayName} • ${u.email}`;
    return u.displayName || u.email || "Unknown";
  };

  const handleShowDetails = (transaction) => {
    setSelectedTx(transaction);
    setDetailsModalVisible(true);
  };

  const renderTransactionItem = (transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={{ marginBottom: SPACING.md }}
      onPress={() => handleShowDetails(transaction)}
    >
      <Card>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIconContainer}>
            <MaterialCommunityIcons name="receipt" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>{transaction.planTitle}</Text>
            <Text style={styles.transactionDate}>
              {formatDate(transaction.purchaseDate)}
            </Text>
            {isAdmin && (
              <Text style={styles.transactionOwner}>
                Owner: {getUserLabel(transaction.userId)}
              </Text>
            )}
          </View>
          <StatusBadge status={transaction.status} />
        </View>

        <View style={styles.transactionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{transaction.planDuration} Days</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>₱{transaction.price}</Text>
          </View>
          {transaction.expirationDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expires</Text>
              <Text style={styles.detailValue}>{formatDate(transaction.expirationDate)}</Text>
            </View>
          )}
          {transaction.status === "active" && transaction.expirationDate && (
            <View style={styles.countdownRow}>
              <MembershipCountdown expirationDate={transaction.expirationDate} compact />
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
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
              <Text style={styles.headerTitle}>Transaction Details</Text>
              <View style={{ width: 40 }} />
            </View>
          </View>

          {selectedTx && (
            <ScrollView contentContainerStyle={styles.scroll}>
              <Card style={styles.detailsCard}>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Plan</Text>
                  <Text style={styles.detailsValue}>{selectedTx.planTitle}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Status</Text>
                  <StatusBadge status={selectedTx.status} />
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Duration</Text>
                  <Text style={styles.detailsValue}>{selectedTx.planDuration} Days</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Price</Text>
                  <Text style={styles.detailsValue}>₱{selectedTx.price}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Purchase Date</Text>
                  <Text style={styles.detailsValue}>{formatDate(selectedTx.purchaseDate)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Expiration Date</Text>
                  <Text style={styles.detailsValue}>
                    {selectedTx.expirationDate ? formatDate(selectedTx.expirationDate) : "N/A"}
                  </Text>
                </View>
                {isAdmin && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Owner</Text>
                      <Text style={styles.detailsValue}>{getUserLabel(selectedTx.userId)}</Text>
                    </View>
                  </>
                )}
                <View style={styles.divider} />
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Transaction ID</Text>
                  <Text style={[styles.detailsValue, { fontSize: FONTS.sizes.xs }]}>
                    {selectedTx.id}
                  </Text>
                </View>
              </Card>
            </ScrollView>
          )}
        </LinearGradient>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isAdmin ? "All Transactions" : "Your Transactions"}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={40} color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="receipt"
            title="No Transactions Yet"
            subtitle={
              isAdmin
                ? "No membership transactions found"
                : "Purchase a membership plan to see your transaction history here"
            }
            action={!isAdmin ? "Browse Plans" : undefined}
            onAction={() => navigation.navigate("Membership")}
          />
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map(renderTransactionItem)}
          </View>
        )}
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING["4xl"],
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  transactionsList: {
    gap: 0,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}22`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.base,
    fontWeight: "700",
    marginBottom: 2,
  },
  transactionDate: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
  },
  transactionOwner: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
    marginTop: SPACING.xs,
  },
  transactionDetails: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countdownRow: {
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
  },
  detailValue: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
  },
  // Details Modal Styles
  detailsCard: {
    marginBottom: 0,
  },
  detailsField: {
    paddingVertical: SPACING.sm,
  },
  detailsRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: SPACING.md,
  },
  detailsLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
  },
  detailsValue: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: "700",
    marginTop: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
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
});

export default TransactionsScreen;
