// BAKAL GYM - Settings Screen
// Users can update their account information

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { GymLogo, PrimaryButton, Card, SectionHeader } from "../../components/index";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants";

const SettingsScreen = ({ navigation }) => {
  const { user, userData, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || "");
      setPhone(userData.phone || "");
    }
  }, [userData]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name is required");
      return;
    }

    setLoading(true);
    const result = await updateProfile({
      displayName: displayName.trim(),
      phone: phone.trim(),
    });
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Profile updated successfully");
    } else {
      Alert.alert("Error", result.error || "Failed to update profile");
    }
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Info Section */}
        <SectionHeader title="Account Information" />
        <Card style={styles.infoCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL (BAWAL ILISAN)</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>USER ID</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{user?.uid}</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>ROLE</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{userData?.role || "USER"}</Text>
            </View>
          </View>
        </Card>

        {/* Save Button */}
        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          style={styles.saveBtn}
        />

        {/* Account Info */}
        <SectionHeader title="Account Details" />
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {userData?.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>
                {userData?.updatedAt ? new Date(userData.updatedAt.toDate()).toLocaleDateString() : "N/A"}
              </Text>
            </View>
          </View>
        </Card>
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
  infoCard: {
    marginBottom: SPACING.xl,
  },
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    height: 52,
    justifyContent: "center",
  },
  input: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
  },
  disabledInput: {
    backgroundColor: `${COLORS.surface}66`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    height: 52,
    justifyContent: "center",
  },
  disabledText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.base,
  },
  saveBtn: {
    marginBottom: SPACING.xl,
  },
  detailsCard: {
    marginBottom: SPACING.xl,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    marginBottom: 2,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.base,
    fontWeight: "600",
  },
});

export default SettingsScreen;
