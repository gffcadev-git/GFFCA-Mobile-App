import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SignInProps }        from '../../navigation/types';
import { useColors, useSpacing, useTypography, useAssets } from '../../theme';
import { AppInput }           from '../../components/AppInput';
import { AppButton }          from '../../components/AppButton';
import { AssetImage }         from '../../components/AssetImage';
import { Icon }               from '../../components/Icon';
import { useBiometrics, BiometricMethod } from '../../services/biometrics';
import { api, type ApiError }  from '../../apiCall';
import { useAuthStore }        from '../../stores/authStore';
import { biometricRefreshToken, hasBiometricLogin, disableBiometric } from '../../services/biometricCredentials';

/** Tenants a user can sign in under. Value is sent to the API; label is shown. */
const TENANTS = [
  { code: 'gff', label: 'GFF' },
  { code: 'nff', label: 'NFF' },
] as const;

export function SignInScreen({ navigation }: Readonly<SignInProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const assets = useAssets();
  const insets = useSafeAreaInsets();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [tenantCode, setTenantCode] = useState<string>('gff'); // GFF selected by default
  const [loading, setLoading]   = useState(false);

  const { methods, available } = useBiometrics();
  const signIn    = useAuthStore((s) => s.signIn);
  const setTokens = useAuthStore((s) => s.setTokens);

  // Whether a biometric login credential has been enrolled in the Keychain.
  const [bioEnrolled, setBioEnrolled] = useState(false);
  useEffect(() => {
    hasBiometricLogin().then(setBioEnrolled);
  }, []);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { accessToken, refreshToken, user } = await api.auth.login({
        email: email.trim(),
        password,
        tenantCode,
      });
      await signIn({ token: accessToken, refreshToken, user });
    } catch (err) {
      const message = (err as ApiError)?.message ?? 'Unable to sign in. Please try again.';
      Alert.alert('Sign in failed', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBiometric(method: BiometricMethod) {
    if (loading) return;
    // Sensor is present but nothing is enrolled yet — point the user to Profile.
    if (!bioEnrolled) {
      Alert.alert(
        'Biometric sign-in not set up',
        'Sign in with your password first, then turn on biometric sign-in from Profile.',
      );
      return;
    }
    const label = method === 'faceid' ? 'Face ID' : 'fingerprint';
    setLoading(true);
    try {
      // Reading the biometric-gated Keychain entry triggers the OS prompt and
      // returns the stored refresh token only on a successful scan.
      const storedRefresh = await biometricRefreshToken(`Sign in with ${label}`);
      if (!storedRefresh) return; // cancelled or scan failed — stay on the form

      // Exchange it for a fresh session, then establish the signed-in state.
      // setTokens first so the axios interceptor authorises the me() request.
      const { accessToken } = await api.auth.refresh(storedRefresh);
      await setTokens({ token: accessToken, refreshToken: storedRefresh });
      const user = await api.auth.me();
      await signIn({ token: accessToken, refreshToken: storedRefresh, user });
    } catch {
      // Refresh token expired/revoked — drop the stale entry and fall back to password.
      await disableBiometric();
      setBioEnrolled(false);
      Alert.alert(
        'Biometric sign-in expired',
        'Please sign in with your password. You can re-enable it from your profile.',
      );
    } finally {
      setLoading(false);
    }
  }

  const styles = makeStyles(sp, typo);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + sp.xxl, paddingBottom: insets.bottom + sp.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand — remote logo graphic with text wordmark fallback */}
        <View style={styles.brand}>
          <AssetImage
            uri={assets.logo}
            style={styles.logo}
            resizeMode="contain"
            fallback={<Text style={[styles.appName, { color: colors.text.primary }]}>GFF Portal</Text>}
          />
          <Text style={[styles.tagline, { color: colors.text.secondary }]}>
            Skating Instructors Platform
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Tenant code selector — GFF by default */}
          <View style={styles.tenantWrap}>
            <Text style={[styles.tenantLabel, { color: colors.text.secondary }]}>Tenant code</Text>
            <View style={[styles.segmented, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
              {TENANTS.map((t) => {
                const selected = tenantCode === t.code;
                return (
                  <TouchableOpacity
                    key={t.code}
                    style={[styles.segment, selected && { backgroundColor: colors.primary.main }]}
                    activeOpacity={0.8}
                    onPress={() => setTenantCode(t.code)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    {selected && <Icon name="check" size={16} color={colors.primary.contrastText} />}
                    <Text
                      style={[
                        styles.segmentText,
                        { color: selected ? colors.primary.contrastText : colors.text.secondary },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <AppInput
            label="Email address"
            placeholder="james@acmesports.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <AppInput
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            secureToggle
            rightLabel="Forgot password?"
            onRightLabelPress={() => navigation.navigate('ForgotPasswordEmail')}
            value={password}
            onChangeText={setPassword}
          />

          <AppButton
            title="Sign In"
            onPress={handleSignIn}
            loading={loading}
            style={styles.signInBtn}
          />
        </View>

        {/* Biometric sign-in — shown whenever the sensor exists; tapping before
            enrolment nudges the user to set it up in Profile */}
        {available && (
          <>
            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.line, { backgroundColor: colors.divider }]} />
              <Text style={[styles.orText, { color: colors.text.secondary }]}>or</Text>
              <View style={[styles.line, { backgroundColor: colors.divider }]} />
            </View>

            {/* Biometric buttons — iOS shows Face ID only, Android shows both */}
            <View style={styles.biometricRow}>
              {methods.map((method, index) => (
                <React.Fragment key={method}>
                  {index > 0 && <View style={styles.biometricGap} />}
                  <AppButton
                    title={method === 'faceid' ? 'Face ID' : 'Fingerprint'}
                    variant="outline"
                    style={styles.biometricBtn}
                    icon={
                      <Icon
                        name={method === 'faceid' ? 'face-recognition' : 'fingerprint'}
                        size={18}
                        color={colors.text.primary}
                      />
                    }
                    onPress={() => handleBiometric(method)}
                  />
                </React.Fragment>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View
          style={[
            styles.footer,
            { 
              paddingBottom:   insets.bottom + sp.sm,
            },
          ]}
        >
            {/* Terms */}
            <TouchableOpacity
              onPress={() => navigation.navigate('TermsAndConditions')}
              style={styles.termsRow}
            >
              <Text style={[styles.termsText, { color: colors.text.secondary }]}>
                By signing up, you agree to our{' '}
                <Text style={{ color: colors.text.link }}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>
        </View>


       
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:         { flex: 1 },
    scroll:       { flexGrow: 1, paddingHorizontal: sp.screenHorizontal },
    brand:        { alignItems: 'center', marginBottom: sp.xxl },
    logo:         { width: 200, height: 48 },
    appName:      { fontSize: typo.fontSize.xxxl, fontWeight: typo.fontWeight.bold, letterSpacing: typo.letterSpacing.wide },
    tagline:      { fontSize: typo.fontSize.md, marginTop: sp.xxs + 2 },
    form:         { marginBottom: sp.xs },
    tenantWrap:   { marginBottom: sp.md },
    tenantLabel:  { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.medium, marginBottom: sp.xs },
    segmented: {
      flexDirection: 'row',
      borderWidth:   1,
      borderRadius:  typo.borderRadius.md,
      padding:       sp.xxs,
      gap:           sp.xxs,
    },
    segment: {
      flex:            1,
      flexDirection:   'row',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             sp.xxs,
      paddingVertical: sp.sm,
      borderRadius:    typo.borderRadius.sm,
    },
    segmentText:  { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.semiBold },
    signInBtn:    { marginTop: sp.xs },
    dividerRow:   { flexDirection: 'row', alignItems: 'center', marginVertical: sp.lg },
    line:         { flex: 1, height: 1 },
    orText:       { marginHorizontal: sp.inputHorizontal, fontSize: typo.fontSize.sm },
    biometricRow: { flexDirection: 'row', marginBottom: sp.xl },
    biometricBtn: { flex: 1 },
    biometricGap: { width: sp.sm },
    termsRow:     { alignItems: 'center'},
    termsText:    { fontSize: typo.fontSize.xs, textAlign: 'center', lineHeight: typo.lineHeight.tight },
    footer:       {
      position:          'absolute',
      bottom:            0,
      left:              0,
      right:             0,
      paddingTop:        sp.sm,
      paddingHorizontal: sp.screenHorizontal,
      //borderTopWidth:    1,
    },
  });
}
