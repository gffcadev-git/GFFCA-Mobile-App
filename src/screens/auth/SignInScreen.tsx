import React, { useState } from 'react';
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
import { useColors, useSpacing, useTypography } from '../../theme';
import { AppInput }           from '../../components/AppInput';
import { AppButton }          from '../../components/AppButton';
import { Icon }               from '../../components/Icon';
import { useBiometrics, BiometricMethod } from '../../services/biometrics';

export function SignInScreen({ navigation }: Readonly<SignInProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const { methods, authenticate } = useBiometrics();

  function handleSignIn() {
    setLoading(true);
    // TODO: wire up auth API
    setTimeout(() => setLoading(false), 1500);
  }

  async function handleBiometric(method: BiometricMethod) {
    const label = method === 'faceid' ? 'Face ID' : 'fingerprint';
    const ok = await authenticate(`Sign in with ${label}`);
    if (ok) {
      // TODO: exchange the biometric result for a session token, then route
      handleSignIn();
    } else {
      Alert.alert('Authentication failed', `Could not verify ${label}. Please try again or use your password.`);
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
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={[styles.appName, { color: colors.text.primary }]}>GFF Portal</Text>
          <Text style={[styles.tagline, { color: colors.text.secondary }]}>
            Skating Instructors Platform
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
    appName:      { fontSize: typo.fontSize.xxxl, fontWeight: typo.fontWeight.bold, letterSpacing: typo.letterSpacing.wide },
    tagline:      { fontSize: typo.fontSize.md, marginTop: sp.xxs + 2 },
    form:         { marginBottom: sp.xs },
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
