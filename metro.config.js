const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver for PlatformConstants to fix react-native-gesture-handler issue
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
