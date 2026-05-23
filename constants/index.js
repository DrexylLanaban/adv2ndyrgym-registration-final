// BAKAL GYM - App Constants
// Colors, theme, membership plans, and other constants

// ============================================================
// COLOR PALETTE - Dark gym aesthetic
// ============================================================
export const COLORS = {
  // Backgrounds
  background: "#0A0A0A",
  surface: "#141414",
  card: "#1C1C1C",
  cardBorder: "#2A2A2A",

  // Brand
  primary: "#E8FF00",       // Electric yellow-green (gym energy)
  primaryDark: "#B8CC00",
  primaryLight: "#F0FF4D",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#606060",
  textDark: "#0A0A0A",

  // Status
  success: "#00E676",
  warning: "#FFB300",
  danger: "#FF1744",
  info: "#00B0FF",

  // Gradients (used as array for LinearGradient)
  gradientPrimary: ["#E8FF00", "#B8CC00"],
  gradientDark: ["#1C1C1C", "#0A0A0A"],
  gradientCard: ["#1E1E1E", "#141414"],
  gradientHeader: ["#1C1C1C", "#0F0F0F"],

  // Misc
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.7)",
  divider: "#2A2A2A",
};

// ============================================================
// TYPOGRAPHY
// ============================================================
export const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 40,
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
};

// ============================================================
// SPACING
// ============================================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
};


// BORDER RADIUS

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 24,
  full: 9999,
};


// MEMBERSHIP PLANS (PHP Peso)

export const MEMBERSHIP_PLANS = [
  {
    id: "plan_test",
    title: "Testing Only",
    subtitle: "1 minute test",
    duration: 1,
    durationLabel: "1 Minute",
    price: 0,
    priceLabel: "₱0",
    features: [
      "1 minute membership",
      "Test expiration logic",
    ],
    popular: false,
    color: COLORS.info,
    isTestingPlan: true,
  },
  {
    id: "plan_7days",
    title: "Pasingot Pass",
    subtitle: "Try us out",
    duration: 7,
    durationLabel: "7 Days",
    price: 299,
    priceLabel: "₱299",
    features: [
      "Full gym access",
      "Locker room access",
      "Basic equipment",
      "1 guest pass",
    ],
    popular: false,
    color: COLORS.info,
  },
  {
    id: "plan_30days",
    title: "Binulan Pass",
    subtitle: "Most popular",
    duration: 30,
    durationLabel: "30 Days",
    price: 999,
    priceLabel: "₱999",
    features: [
      "Full gym access",
      "Locker room access",
      "All equipment",
      "3 guest passes",
      "Fitness assessment",
    ],
    popular: true,
    color: COLORS.primary,
  },
  {
    id: "plan_annual",
    title: "Gym Rat Pass",
    subtitle: "Best value",
    duration: 365,
    durationLabel: "365 Days",
    price: 8999,
    priceLabel: "₱8,999",
    features: [
      "Full gym access",
      "Locker room access",
      "All equipment",
      "Unlimited guest passes",
      "Personal trainer (2x/month)",
      "Nutrition consultation",
    ],
    popular: false,
    color: COLORS.warning,
  },
];

// ============================================================
// MEMBERSHIP STATUS
// ============================================================
export const MEMBERSHIP_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  PENDING: "pending",
  CANCELLED: "cancelled",
};

// ============================================================
// USER ROLES
// ============================================================
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

// ============================================================
// ADMIN CREDENTIALS (for seeding)
// ============================================================
export const ADMIN_EMAIL = "admin@bakalgym.com";

// ============================================================
// APP INFO
// ============================================================
export const APP_INFO = {
  name: "BAKAL GYM",
  tagline: "Forge Your Strength",
  version: "1.0.0",
  contact: "info@bakalgym.com",
  address: "123 Iron Street, Davao City",
  phone: "+63 912 345 6789",
};