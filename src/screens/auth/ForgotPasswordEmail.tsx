import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets }        from 'react-native-safe-area-context';
import { ForgotPasswordEmailProps } from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { AppInput }                 from '../../components/AppInput';
import { AppButton }                from '../../components/AppButton';
import { ScreenHeader }             from '../../components/ScreenHeader';
import { Icon }                     from '../../components/Icon';

export function ForgotPasswordEmail({ navigation }: Readonly<ForgotPasswordEmailProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleSend() {
    if (!email) return;
    setLoading(true);
    // TODO: call password reset API
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('ForgotPasswordConfirmation', { email });
    }, 1200);
  }

  const styles = makeStyles(sp, typo);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Reset password" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + sp.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Lock icon — left-aligned rounded square */}
        <View style={[styles.iconWrap, { backgroundColor: colors.background.elevated }]}>
          <Icon name="lock" size={26} color={colors.primary.light} />
        </View>

        <Text style={[styles.heading, { color: colors.text.primary }]}>
          Forgot your password?
        </Text>
        <Text style={[styles.sub, { color: colors.text.secondary }]}>
          Enter the email address linked to your account and we'll send you a secure link to reset your password.
        </Text>

        <AppInput
          label="Email address"
          placeholder="james@acmeexports.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <AppButton
          title="Send reset link"
          onPress={handleSend}
          loading={loading}
          disabled={!email}
        />
      </ScrollView>

      {/* Footer — fixed at bottom */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + sp.sm }]}>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            Remembered it?{'  '}
            <Text style={{ color: colors.text.link }}>Back to sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { flexGrow: 1, paddingHorizontal: sp.screenHorizontal, paddingTop: sp.lg },

    // Left-aligned rounded square (matches design — NOT a circle)
    iconWrap: {
      width:          56,
      height:         56,
      borderRadius:   typo.borderRadius.lg,
      alignItems:     'center',
      justifyContent: 'center',
      marginBottom:   sp.lg,
    },

    heading: {
      fontSize:     typo.fontSize.xxl,
      fontWeight:   typo.fontWeight.bold,
      marginBottom: sp.sm,
    },
    sub: {
      fontSize:     typo.fontSize.md,
      lineHeight:   typo.lineHeight.normal,
      marginBottom: sp.xl,
    },

    footer: {
      position:          'absolute',
      bottom:            0,
      left:              0,
      right:             0,
      alignItems:        'center',
      paddingTop:        sp.sm,
      paddingHorizontal: sp.screenHorizontal,
    },
    footerText: { fontSize: typo.fontSize.sm },
  });
}
