import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { ChangePasswordProps }     from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { AppInput }                from '../../components/AppInput';
import { AppButton }               from '../../components/AppButton';
import { WizardFooter }            from '../../components/WizardFooter';
import { Icon }                    from '../../components/Icon';

// ─── Rule — a single "password must include" checklist line ───────────────────

function Rule({ met, label }: Readonly<{ met: boolean; label: string }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  return (
    <View style={[ruleStyles.row, { gap: sp.xs }]}>
      <Icon
        name={met ? 'check-circle' : 'check-circle-outline'}
        size={16}
        color={met ? colors.success.main : colors.text.disabled}
      />
      <Text style={{ color: met ? colors.text.primary : colors.text.secondary, fontSize: typo.fontSize.sm }}>
        {label}
      </Text>
    </View>
  );
}

const ruleStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ChangePasswordScreen({ navigation }: Readonly<ChangePasswordProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  const [current, setCurrent] = useState('');
  const [next,    setNext]    = useState('');
  const [confirm, setConfirm] = useState('');

  // Live validation — drives both the checklist and the button's enabled state.
  const rules = {
    length:    next.length >= 8,
    uppercase: /[A-Z]/.test(next),
    number:    /[0-9]/.test(next),
    match:     next.length > 0 && next === confirm,
  };
  const allValid = Object.values(rules).every(Boolean) && current.length > 0;

  function handleUpdate() {
    if (!allValid) return;
    // TODO: call the change-password endpoint once it's available.
    Alert.alert('Password updated', "You're still signed in on this device.", [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Change password" titleAlign="left" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.buttonHeight + sp.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Lock tile */}
        <View style={[styles.lockTile, { backgroundColor: `${colors.primary.main}26` }]}>
          <Icon name="lock-outline" size={26} color={colors.primary.light} />
        </View>

        <Text style={[styles.intro, { color: colors.text.secondary }]}>
          Enter your current password, then choose a new one. You'll stay signed in on this device.
        </Text>

        <AppInput
          label="Current password"
          placeholder="Enter current password"
          secureTextEntry
          secureToggle
          value={current}
          onChangeText={setCurrent}
        />
        <AppInput
          label="New password"
          placeholder="Enter new password"
          secureTextEntry
          secureToggle
          value={next}
          onChangeText={setNext}
        />
        <AppInput
          label="Confirm new password"
          placeholder="Re-enter new password"
          secureTextEntry
          secureToggle
          value={confirm}
          onChangeText={setConfirm}
        />

        {/* Requirements checklist */}
        <View style={[styles.rulesCard, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <Text style={[styles.rulesHeading, { color: colors.text.secondary }]}>PASSWORD MUST INCLUDE</Text>
          <Rule met={rules.length}    label="At least 8 characters" />
          <Rule met={rules.uppercase} label="One uppercase letter" />
          <Rule met={rules.number}    label="One number" />
          <Rule met={rules.match}     label="Passwords match" />
        </View>
      </ScrollView>

      <WizardFooter>
        <AppButton title="Update password" onPress={handleUpdate} disabled={!allValid} style={styles.updateBtn} />
      </WizardFooter>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.lg },

    lockTile: {
      width:          52,
      height:         52,
      borderRadius:   typo.borderRadius.md,
      alignItems:     'center',
      justifyContent: 'center',
      marginBottom:   sp.md,
    },
    intro: { fontSize: typo.fontSize.sm, lineHeight: typo.lineHeight.normal, marginBottom: sp.lg },

    rulesCard: {
      borderWidth:  1,
      borderRadius: typo.borderRadius.lg,
      padding:      sp.md,
      gap:          sp.sm,
      marginTop:    sp.xs,
    },
    rulesHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.xxs,
    },

    updateBtn: { flex: 1 },
  });
}
