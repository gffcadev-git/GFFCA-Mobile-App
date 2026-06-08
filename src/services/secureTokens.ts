import * as Keychain from 'react-native-keychain';

/**
 * Secure storage for auth tokens, backed by the platform secure enclave:
 *   • iOS     → Keychain
 *   • Android → Keystore (EncryptedSharedPreferences / hardware-backed)
 *
 * Tokens never touch MMKV/AsyncStorage — only this module reads/writes them.
 * Access/refresh tokens are stored together as one JSON entry so a single
 * Keychain round-trip loads the whole session.
 */

const TOKENS_SERVICE = 'com.gffca.auth.tokens';
/** Username field is unused for our purposes but required by the API. */
const ACCOUNT = 'gffca';

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

/** Persist the access + refresh tokens to the secure store. */
export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await Keychain.setGenericPassword(ACCOUNT, JSON.stringify(tokens), {
    service: TOKENS_SERVICE,
    // Readable only while the device is unlocked, and never migrated to a
    // new device via backup/restore.
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/** Load the stored tokens, or `null` if none are saved / the entry is invalid. */
export async function loadTokens(): Promise<StoredTokens | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: TOKENS_SERVICE });
    if (!creds) return null;
    const parsed = JSON.parse(creds.password) as Partial<StoredTokens>;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken };
  } catch {
    // Corrupt entry or Keychain read failure — treat as signed out.
    return null;
  }
}

/** Remove the stored tokens (sign out). */
export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({ service: TOKENS_SERVICE });
}
