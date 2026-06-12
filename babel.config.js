module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4 ships its worklets engine as `react-native-worklets`; its babel
  // plugin transforms `'worklet'` functions and MUST be the LAST plugin. Without
  // it, worklet handlers (used by react-native-keyboard-controller's
  // KeyboardProvider) blow up at runtime with "undefined" property errors.
  plugins: ['react-native-worklets/plugin'],
};
