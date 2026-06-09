/* eslint-disable no-undef */

// react-native-gesture-handler test setup (no-op gestures in Jest)
import 'react-native-gesture-handler/jestSetup';

// In-memory mock for react-native-mmkv (native module isn't available in Jest)
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (k) => (store.has(k) ? store.get(k) : undefined),
      set: (k, v) => store.set(k, v),
      delete: (k) => store.delete(k),
      getBoolean: (k) => store.get(k),
      getNumber: (k) => store.get(k),
      contains: (k) => store.has(k),
      clearAll: () => store.clear(),
    })),
  };
});

// Biometrics native module isn't present in Jest → report "unavailable"
jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn().mockResolvedValue({ available: false, biometryType: undefined }),
    simplePrompt: jest.fn().mockResolvedValue({ success: false }),
  })),
  BiometryTypes: { TouchID: 'TouchID', FaceID: 'FaceID', Biometrics: 'Biometrics' },
}));

// OCR / camera native modules aren't present in Jest — stub the surface the app uses.
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: () => undefined,
  useCameraPermission: () => ({ hasPermission: false, requestPermission: jest.fn().mockResolvedValue(false) }),
  usePhotoOutput: () => ({ capturePhotoToFile: jest.fn().mockResolvedValue({ filePath: '' }) }),
}));

jest.mock('@react-native-ml-kit/text-recognition', () => ({
  __esModule: true,
  default: { recognize: jest.fn().mockResolvedValue({ text: '' }) },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn().mockResolvedValue({ didCancel: true }),
}));

// Avoid real network calls for the remote theme fetch during tests
globalThis.fetch = jest.fn(() => Promise.reject(new Error('network disabled in tests')));
