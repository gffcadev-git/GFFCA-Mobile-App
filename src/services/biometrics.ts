import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';

// A single shared instance. `allowDeviceCredentials: false` keeps the prompt
// biometric-only (no PIN/passcode fallback).
const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: false });

/** Underlying sensor reported by the OS. `null` when none is enrolled. */
export type BiometryKind = 'FaceID' | 'TouchID' | 'Biometrics' | null;

/** UI method we surface to the user. */
export type BiometricMethod = 'faceid' | 'fingerprint';

/**
 * Which biometric methods to display, per product rule:
 *  - iOS      → Face ID only
 *  - Android  → both Biometric (fingerprint) and Face ID
 */
export function getBiometricMethods(): BiometricMethod[] {
  return Platform.OS === 'ios' ? ['faceid'] : ['fingerprint', 'faceid'];
}

/** Reads whether a biometric sensor is available and what kind it is. */
export async function getBiometrySensor(): Promise<{ available: boolean; type: BiometryKind }> {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return { available, type: (biometryType ?? null) as BiometryKind };
  } catch {
    // Native module not linked yet / no hardware — fail closed.
    return { available: false, type: null };
  }
}

/**
 * Presents the system biometric prompt (Face ID / Touch ID on iOS, the
 * BiometricPrompt on Android). Resolves `true` only on a successful scan.
 */
export async function authenticateBiometric(promptMessage: string): Promise<boolean> {
  try {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });
    return success;
  } catch {
    return false;
  }
}

/**
 * Convenience hook exposing sensor availability and the platform method list
 * alongside the authenticate call.
 */
export function useBiometrics() {
  const [available, setAvailable] = useState(false);
  const [type, setType]           = useState<BiometryKind>(null);

  useEffect(() => {
    let mounted = true;
    getBiometrySensor().then(({ available: a, type: t }) => {
      if (mounted) {
        setAvailable(a);
        setType(t);
      }
    });
    return () => { mounted = false; };
  }, []);

  return {
    available,
    type,
    methods: getBiometricMethods(),
    authenticate: authenticateBiometric,
  };
}
