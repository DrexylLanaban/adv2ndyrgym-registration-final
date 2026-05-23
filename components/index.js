// BAKAL GYM - Reusable UI Components

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants";


// LOGO COMPONENT - Vectors onli

export const GymLogo = ({ size = "md", showText = true }) => {
  const iconSize = size === "lg" ? 48 : size === "sm" ? 24 : 36;
  const titleSize = size === "lg" ? 32 : size === "sm" ? 18 : 24;
  const subtitleSize = size === "lg" ? 12 : size === "sm" ? 9 : 10;

  return (
    <View style={styles.logoContainer}>
      {/* Logo Icon - Dumbbell logo */}
      <View style={[styles.logoBadge, { width: iconSize * 1.8, height: iconSize * 1.8, borderRadius: iconSize * 0.45 }]}>
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={[styles.logoBadgeGradient, { borderRadius: iconSize * 0.45 }]}
        >
          <MaterialCommunityIcons
            name="dumbbell"
            size={iconSize}
            color={COLORS.black}
          />
        </LinearGradient>
      </View>

      {/* Logo Text */}
      {showText && (
        <View style={styles.logoTextContainer}>
          <Text style={[styles.logoTitle, { fontSize: titleSize }]}>BAKAL</Text>
          <View style={styles.logoSubRow}>
            
            <Text style={[styles.logoSubtitle, { fontSize: subtitleSize }]}>GYM</Text>
            
          </View>
        </View>
      )}
    </View>
  );
};

// ============================================================
// PRIMARY BUTTON
// ============================================================
export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.primaryBtn, disabled && styles.disabledBtn, style]}
    activeOpacity={0.85}
  >
    <LinearGradient
      colors={disabled ? ["#444", "#333"] : COLORS.gradientPrimary}
      style={styles.primaryBtnGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.black} size="small" />
      ) : (
        <View style={styles.btnInner}>
          {icon && <View style={styles.btnIconLeft}>{icon}</View>}
          <Text style={[styles.primaryBtnText, textStyle]}>{title}</Text>
        </View>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

// ============================================================
// SECONDARY BUTTON (outline)
// ============================================================
export const SecondaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  color,
  icon,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    style={[
      styles.secondaryBtn,
      { borderColor: color || COLORS.primary },
      disabled && styles.disabledBtn,
      style,
    ]}
    activeOpacity={0.75}
  >
    {loading ? (
      <ActivityIndicator color={color || COLORS.primary} size="small" />
    ) : (
      <View style={styles.btnInner}>
        {icon && <View style={styles.btnIconLeft}>{icon}</View>}
        <Text style={[styles.secondaryBtnText, { color: color || COLORS.primary }]}>
          {title}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// ============================================================
// DANGER BUTTON
// ============================================================
export const DangerButton = ({ title, onPress, loading, style, icon }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.dangerBtn, style]}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color={COLORS.white} size="small" />
    ) : (
      <View style={styles.btnInner}>
        {icon && <View style={styles.btnIconLeft}>{icon}</View>}
        <Text style={styles.dangerBtnText}>{title}</Text>
      </View>
    )}
  </TouchableOpacity>
);

// ============================================================
// CARD CONTAINER
// ============================================================
export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ============================================================
// SECTION HEADER
// ============================================================
export const SectionHeader = ({ title, subtitle, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ============================================================
// STATUS BADGE
// ============================================================
export const StatusBadge = ({ status }) => {
  const getConfig = () => {
    switch (status?.toLowerCase()) {
      case "active":
        return { color: COLORS.success, label: "ACTIVE", icon: "checkmark-circle" };
      case "pending":
        return { color: COLORS.warning, label: "PENDING", icon: "time" };
      case "expired":
        return { color: COLORS.danger, label: "EXPIRED", icon: "close-circle" };
      case "cancelled":
        return { color: COLORS.textMuted, label: "CANCELLED", icon: "remove-circle" };
      default:
        return { color: COLORS.textMuted, label: "NONE", icon: "ellipse-outline" };
    }
  };

  const config = getConfig();
  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}22`, borderColor: `${config.color}55` }]}>
      <Ionicons name={config.icon} size={12} color={config.color} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

// ============================================================
// INPUT FIELD
// ============================================================
export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  icon,
  editable = true,
  style,
}) => (
  <View style={[styles.inputWrapper, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={[styles.inputContainer, !editable && styles.inputDisabled]}>
      {icon && <View style={styles.inputIcon}>{icon}</View>}
      <Text
        style={styles.inputField}
        // React Native TextInput imported per-screen for proper handling
      />
    </View>
  </View>
);

// ============================================================
// EMPTY STATE
// ============================================================
export const EmptyState = ({ icon, title, subtitle, action, onAction }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
      <MaterialCommunityIcons name={icon || "dumbbell"} size={48} color={COLORS.textMuted} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {action && (
      <PrimaryButton title={action} onPress={onAction} style={styles.emptyAction} />
    )}
  </View>
);

// ============================================================
// LOADING SPINNER
// ============================================================
export const LoadingSpinner = ({ message }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color={COLORS.primary} size="large" />
    {message && <Text style={styles.loadingText}>{message}</Text>}
  </View>
);

// ============================================================
// STAT CARD (for dashboard)
// ============================================================
export const StatCard = ({ icon, value, label, color, style }) => (
  <View style={[styles.statCard, style]}>
    <View style={[styles.statIconBg, { backgroundColor: `${color}22` }]}>
      {icon}
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Import clock and countdown components
export { PhilippinesClock } from "./PhilippinesClock";
export { MembershipCountdown } from "./MembershipCountdown";

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  // Logo
  logoContainer: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  logoBadge: {
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoBadgeGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTextContainer: {
    alignItems: "center",
  },
  logoTitle: {
    color: COLORS.white,
    fontWeight: "900",
    letterSpacing: 6,
  },
  logoSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  logoLine: {
    width: 20,
    height: 1,
    backgroundColor: COLORS.primary,
  },
  logoSubtitle: {
    color: COLORS.primary,
    fontWeight: "700",
    letterSpacing: 8,
  },

  // Buttons
  primaryBtn: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  primaryBtnGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  primaryBtnText: {
    color: COLORS.black,
    fontSize: FONTS.sizes.base,
    fontWeight: "800",
    letterSpacing: 1,
  },
  secondaryBtn: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  secondaryBtnText: {
    fontSize: FONTS.sizes.base,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dangerBtn: {
    borderRadius: RADIUS.lg,
    backgroundColor: `${COLORS.danger}22`,
    borderWidth: 1,
    borderColor: `${COLORS.danger}55`,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  dangerBtnText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.base,
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnIconLeft: {
    marginRight: SPACING.sm,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  sectionAction: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
  },

  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING["4xl"],
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING["2xl"],
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },

  // Stat card
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: SPACING.xs,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.sizes["2xl"],
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Input
  inputWrapper: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputIcon: {
    paddingHorizontal: SPACING.md,
  },
  inputField: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.base,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
});