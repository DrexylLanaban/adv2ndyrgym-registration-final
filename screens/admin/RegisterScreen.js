// BAKAL GYM - Register Screen
// Create new user account with Firebase

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import { GymLogo, PrimaryButton } from "../../components";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants";

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation
  const validate = () => {
    if (!displayName.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Validation Error", "Invalid email format");
      return false;
    }

    if (!password) {
      Alert.alert("Validation Error", "Password is required");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);

    const result = await register(
      email.trim().toLowerCase(),
      password,
      displayName.trim(),
      phone.trim()
    );

    setLoading(false);

    if (result.success) {
      Alert.alert(
        "✓ Account Created Successfully!",
        `Welcome ${displayName}! Your account has been created. Please sign in to continue.`,
        [
          {
            text: "Sign In",
            onPress: () => navigation.replace("Login"),
          },
        ]
      );
    } else {
      let errorMsg = result.error || "Registration failed";
      if (errorMsg.includes("email-already-in-use")) {
        errorMsg = "This email is already registered. Please try another email or sign in.";
      } else if (errorMsg.includes("weak-password")) {
        errorMsg = "Password is too weak. Please use at least 6 characters.";
      } else if (errorMsg.includes("invalid-email")) {
        errorMsg = "Invalid email address. Please check and try again.";
      }
      Alert.alert("Registration Failed", errorMsg);
    }
  };

  return (
    <LinearGradient
      colors={["#0A0A0A", "#141414"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <GymLogo size="lg" />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Us sa Bakal Gym kung mahilig ka sa Weights!
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.textSecondary}
              />

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color={COLORS.textSecondary}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={COLORS.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textSecondary}
              />

              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.textSecondary}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <PrimaryButton
              title="CREATE ACCOUNT"
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            />

            {/* Login Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.xl,
  },

  logoSection: {
    alignItems: "center",
    marginBottom: SPACING["3xl"],
  },

  header: {
    marginBottom: SPACING.xl,
  },

  title: {
    color: COLORS.white,
    fontSize: FONTS.sizes["3xl"],
    fontWeight: "800",
    marginBottom: SPACING.sm,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
  },

  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS["2xl"],
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 54,
  },

  input: {
    flex: 1,
    color: COLORS.white,
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.base,
  },

  button: {
    marginTop: SPACING.md,
  },

  loginLink: {
    marginTop: SPACING.lg,
    alignItems: "center",
  },

  loginText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },

  loginBold: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});