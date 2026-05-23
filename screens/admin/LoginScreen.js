// BAKAL GYM - Login Screen
// Email/password authentication with Firebase

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { GymLogo, PrimaryButton } from "../../components";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants";

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (!result.success) {
      let msg = "Login failed. Please try again.";
      if (result.error?.includes("user-not-found")) msg = "No account found with this email.";
      else if (result.error?.includes("wrong-password")) msg = "Incorrect password.";
      else if (result.error?.includes("too-many-requests")) msg = "Too many login attempts. Try again later.";
      else if (result.error?.includes("auth/invalid-email")) msg = "Invalid email address.";
      else if (result.error?.includes("400")) msg = "Authentication failed. Please check your email and password.";
      Alert.alert("Login Failed", msg);
    } else {
      // Navigate to Dashboard on successful login
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    }
  };

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top accent bar */}
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.topBar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />

          {/* Logo */}
          <View style={styles.logoSection}>
            <GymLogo size="lg" />
          </View>

          {/* Heading */}
          <View style={styles.headingSection}>
            <Text style={styles.heading}>Welcome to Bakal Gym</Text>
            <Text style={styles.subheading}>Sign in kana dawg!</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={[styles.inputBox, errors.email && styles.inputError]}>
                
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: null }); }}
                  placeholder="Enter Email"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={[styles.inputBox, errors.password && styles.inputError]}>
                
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: null }); }}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Login Button */}
            <PrimaryButton
              title="SIGN IN"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerLinkText}>
                Don't have an account?{" "}
                <Text style={styles.registerLinkBold}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Admin hint */}
          <View style={styles.adminHint}>
            <MaterialCommunityIcons name="shield-account" size={14} color={COLORS.textMuted} />
            <Text style={styles.adminHintText}>Admin acc, pakibasa: admin@bakalgym.com</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: SPACING["3xl"],
  },
  topBar: {
    height: 4,
    width: "100%",
  },
  logoSection: {
    alignItems: "center",
    paddingTop: SPACING["4xl"],
    paddingBottom: SPACING["2xl"],
  },
  headingSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  heading: {
    color: COLORS.white,
    fontSize: FONTS.sizes["3xl"],
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  subheading: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
  },
  formCard: {
    marginHorizontal: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS["2xl"],
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  fieldGroup: {
    marginBottom: SPACING.base,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    height: 52,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.xs,
    marginTop: 4,
  },
  loginBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    letterSpacing: 1,
  },
  registerLink: {
    alignItems: "center",
    padding: SPACING.sm,
  },
  registerLinkText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  registerLinkBold: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  adminHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    marginTop: SPACING.xl,
  },
  adminHintText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    letterSpacing: 0.5,
  },
});

export default LoginScreen;