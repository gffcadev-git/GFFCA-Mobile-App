import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets }              from 'react-native-safe-area-context';
import { ForgotPasswordConfirmationProps } from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }                   from '../../components/ScreenHeader';
import { Icon }                           from '../../components/Icon';

export function ForgotPasswordConfirm({ navigation, route }: Readonly<ForgotPasswordConfirmationProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const { email } = route.params;

  const styles = makeStyles(sp, typo);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <ScreenHeader title="Reset password" onBack={() => navigation.goBack()} />

      <View style={[styles.content, { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.lg }]}>
        {/* Lock icon — same as email screen */}
        <View style={[styles.iconWrap, { backgroundColor: colors.background.elevated }]}>
          <Icon name="lock" size={26} color={colors.primary.light} />
        </View>

        <Text style={[styles.heading, { color: colors.text.primary }]}>
          Forgot your password?
        </Text>
        <Text style={[styles.sub, { color: colors.text.secondary }]}>
          Enter the email address linked to your account and we'll send you a secure link to reset your password.
        </Text>

        {/* Email field — read-only with green success border */}
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>Email address</Text>
        </View>
        <View style={[styles.emailField, { backgroundColor: colors.background.paper, borderColor: colors.success.main }]}>
          <Text style={[styles.emailText, { color: colors.text.primary }]}>{email}</Text>
        </View>

        {/* Non-interactive "sent" button */}
        <View style={[styles.sentBtn, { backgroundColor: colors.primary.main }]}>
          <Icon name="check" size={18} color={colors.white} />
          <Text style={[styles.sentBtnText, { color: colors.white }]}>  Reset link sent</Text>
        </View>

        {/* Success info row */}
        <View style={styles.infoRow}>
          <Icon name="check-circle" size={18} color={colors.success.main} />
          <Text style={[styles.infoText, { color: colors.text.secondary }]}>
            {'  '}We've shared the link to your provided email to reset your password. Check your inbox at{' '}
            <Text style={{ color: colors.text.primary, fontWeight: typo.fontWeight.bold }}>{email}</Text>
            {'.'}
          </Text>
        </View>
      </View>

      {/* Footer — fixed at bottom */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + sp.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            Didn't get the email?{'  '}
            <Text style={{ color: colors.text.link }}>Resend link</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:    { flex: 1 },
    content: { flex: 1 },

    // Left-aligned rounded square — identical to ForgotPasswordEmail
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

    // Email display field
    labelRow:   { marginBottom: sp.xs },
    label:      { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.medium },
    emailField: {
      borderWidth:       1,
      borderRadius:      typo.borderRadius.md,
      paddingHorizontal: sp.inputHorizontal,
      height:            sp.inputHeight,
      justifyContent:    'center',
      marginBottom:      sp.md,
    },
    emailText: { fontSize: typo.fontSize.base },

    // Non-interactive "sent" state button
    sentBtn: {
      height:         sp.buttonHeight,
      borderRadius:   typo.borderRadius.lg,
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'center',
      marginBottom:   sp.md,
    },
    sentBtnText: {
      fontSize:   typo.fontSize.lg,
      fontWeight: typo.fontWeight.semiBold,
    },

    // Success info row
    infoRow: {
      flexDirection: 'row',
      alignItems:    'flex-start',
    },
    infoText: {
      flex:       1,
      fontSize:   typo.fontSize.sm,
      lineHeight: typo.lineHeight.normal,
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
