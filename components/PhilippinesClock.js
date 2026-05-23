import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING } from "../constants";

export const PhilippinesClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getPhilippinesTime = () => {
    // formatter for Philippines timezone
    const options = {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    return time.toLocaleTimeString("en-PH", options);
  };

  return (
    <View style={styles.clockContainer}>
      <Text style={styles.timeText}>{getPhilippinesTime()}</Text>
      <Text style={styles.timezoneText}>Manila Time (GMT+8)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  clockContainer: {
    alignItems: "center",
    paddingVertical: SPACING.md,
    backgroundColor: `${COLORS.primary}11`,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  timeText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.xl,
    fontWeight: "800",
    letterSpacing: 1,
    fontFamily: "monospace",
  },
  timezoneText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default PhilippinesClock;
