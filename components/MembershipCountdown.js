// Membership Countdown Timer Component
// Shows realtime countdown with days, hours, minutes, seconds

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING } from "../constants";
import { getTimeRemaining } from "../services/MembershipService";

export const MembershipCountdown = ({ expirationDate, compact = false }) => {
  const [timeRemaining, setTimeRemaining] = useState(
    getTimeRemaining(expirationDate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(expirationDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationDate]);

  if (timeRemaining.expired) {
    return (
      <View style={styles.expiredContainer}>
        <Ionicons name="close-circle" size={compact ? 16 : 20} color={COLORS.danger} />
        <Text style={[styles.expiredText, compact && styles.compact]}>Expired</Text>
      </View>
    );
  }

  const pad = (num) => String(num).padStart(2, "0");

  if (compact) {
    return (
      <Text style={styles.compactTimer}>
        {pad(timeRemaining.days)}d {pad(timeRemaining.hours)}h{" "}
        {pad(timeRemaining.minutes)}m
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.timerRow}>
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{pad(timeRemaining.days)}</Text>
          <Text style={styles.timeLabel}>Days</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{pad(timeRemaining.hours)}</Text>
          <Text style={styles.timeLabel}>Hours</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{pad(timeRemaining.minutes)}</Text>
          <Text style={styles.timeLabel}>Mins</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeUnit}>
          <Text style={styles.timeValue}>{pad(timeRemaining.seconds)}</Text>
          <Text style={styles.timeLabel}>Secs</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  timeUnit: {
    alignItems: "center",
    minWidth: 40,
  },
  timeValue: {
    color: COLORS.primary,
    fontSize: FONTS.sizes["2xl"],
    fontWeight: "900",
    fontFamily: "monospace",
  },
  timeLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    marginTop: 2,
  },
  separator: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    marginHorizontal: SPACING.xs,
  },
  compactTimer: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  expiredContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  expiredText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.base,
    fontWeight: "700",
  },
  compact: {
    fontSize: FONTS.sizes.xs,
  },
});

export default MembershipCountdown;
