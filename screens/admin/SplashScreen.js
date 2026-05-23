// BAKAL GYM - Splash Screen
// Shown briefly while app initializes

import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { COLORS, FONTS, SPACING } from "../../constants";


const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.7);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay based on auth state
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          });
        } else {
          navigation.replace("Login");
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, loading, navigation]);

  return (
    <LinearGradient
      colors={["#0A0A0A", "#141414", "#0A0A0A"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Glow effect behind logo */}
        <View style={styles.glowContainer}>
          <View style={styles.glow} />
        </View>

        {/* Logo Badge */}
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.logoBadge}
        >
          <MaterialCommunityIcons name="dumbbell" size={60} color="#000" />
        </LinearGradient>

        {/* App Name */}
        <Text style={styles.appName}>BAKAL</Text>
        <View style={styles.subRow}>
          
          <Text style={styles.subName}>GYM</Text>
          
        </View>

        <Text style={styles.tagline}>BALAY NI DOMINIC NAA SA DECA HOMES</Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.loadingRow, { opacity: fadeAnim }]}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={styles.dot}
          />
        ))}
      </Animated.View>

      {/* Bottom tagline */}
      <Animated.Text style={[styles.bottomText, { opacity: fadeAnim }]}>
        BAKALAN GYM REGISTRATION
      </Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  glowContainer: {
    position: "absolute",
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
    position: "absolute",
  },
  logoBadge: {
    width: 110,
    height: 110,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: SPACING.xl,
  },
  appName: {
    color: COLORS.white,
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 12,
    marginBottom: 4,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  line: {
    width: 30,
    height: 1.5,
    backgroundColor: COLORS.primary,
  },
  subName: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 10,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    letterSpacing: 4,
    fontWeight: "500",
  },
  loadingRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    position: "absolute",
    bottom: 120,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  bottomText: {
    position: "absolute",
    bottom: 60,
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    letterSpacing: 1,
  },
});

export default SplashScreen;