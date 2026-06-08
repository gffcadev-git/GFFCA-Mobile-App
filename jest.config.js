module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // The default preset only transforms react-native core. The app also pulls in
  // ESM-published community modules (react-navigation, native modules) that must
  // be transformed for the full-app render test to parse.
  transformIgnorePatterns: [
    'node_modules/(?!(?:(?:jest-)?@?react-native|@react-navigation|react-native-mmkv|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-vector-icons|react-native-biometrics)/)',
  ],
};
