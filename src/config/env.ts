/**
 * Environment configuration. Swap these per build/flavour (or wire to
 * react-native-config / a remote config) when the backend goes live.
 */
export const ENV = {
  /** Base URL for all API calls — replace with the real backend. */
  // API_BASE_URL: 'http://localhost:3000/api',     // host machine (web)
  // API_BASE_URL: 'http://10.0.2.2:3000/api',      // android emulator -> host localhost
  API_BASE_URL: 'http://192.168.1.13:3000/api',     // physical device -> host LAN IP (same Wi-Fi)
  /** Default request timeout in ms. */
  API_TIMEOUT: 20000,
  /** Default tenant code sent with auth requests (hard-coded for now). */
  DEFAULT_TENANT_CODE: 'gff',
};
