import * as Keychain from 'react-native-keychain';

/**
 * Biometric-gated credential for "Sign in with Face ID / fingerprint".
 *
 * Holds the refresh token in a SEPARATE Keychain entry whose access control is
 * the biometric sensor itself: reading it forces the OS Face ID / Touch ID /
 * Android BiometricPrompt and only returns the secret on a successful scan. The
 * gate is enforced by the secure enclave, not by JS — a caller cannot bypass it
 * the way a boolean from `simplePrompt()` could be ignored.
 *
 * This is independent of services/secureTokens (the normal session store): the
 * user enrols once after a password login, and biometric sign-in later reads
 * this entry to obtain a fresh session.
 */

const BIOMETRIC_SERVICE = 'com.gffca.auth.biometric';
/** Username field is unused for our purposes but required by the API. */
const ACCOUNT = 'gffca';

/** Store the refresh token behind a biometric-protected Keychain entry. */
export async function enrollBiometric(refreshToken: string): Promise<void> {
  await Keychain.setGenericPassword(ACCOUNT, refreshToken, {
    service: BIOMETRIC_SERVICE,
    // The scan itself is the access control. BIOMETRY_CURRENT_SET invalidates the
    // entry if the device's enrolled biometrics change (a face/finger is added or
    // removed), forcing a fresh password login + re-enrol — the safer default for
    // a security-sensitive portal.
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    // Readable only while unlocked, and never migrated to a new device.
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/**
 * Read the biometric-gated refresh token. Presents the system biometric prompt
 * as a side effect. Returns `null` if the user cancels, the scan fails, the
 * entry was invalidated (biometrics changed), or nothing is enrolled.
 */
export async function biometricRefreshToken(
  promptTitle = 'Sign in with Face ID',
): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword({
      service: BIOMETRIC_SERVICE,
      authenticationPrompt: { title: promptTitle },
    });
    return creds ? creds.password : null;
  } catch {
    return null;
  }
}

/** Whether a biometric login is enrolled. Does NOT trigger a biometric scan. */
export async function hasBiometricLogin(): Promise<boolean> {
  try {
    return await Keychain.hasGenericPassword({ service: BIOMETRIC_SERVICE });
  } catch {
    return false;
  }
}

/** Remove the biometric login credential (disable the feature). */
export async function disableBiometric(): Promise<void> {
  await Keychain.resetGenericPassword({ service: BIOMETRIC_SERVICE });
}
