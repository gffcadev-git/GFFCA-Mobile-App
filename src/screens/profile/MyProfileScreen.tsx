import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { MyProfileProps }          from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { Avatar }                  from '../../components/Avatar';
import { AppInput }                from '../../components/AppInput';
import { AppButton }               from '../../components/AppButton';
import { SettingsRow }             from '../../components/SettingsRow';
import { WizardFooter }            from '../../components/WizardFooter';
import { Icon, IconName }          from '../../components/Icon';
import { useAuthStore }            from '../../stores/authStore';

/** ("James", "O'Brien") → "JO". */
function initialsOf(first?: string, last?: string): string {
  return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase() || '—';
}

/** "customer" → "Customer". */
function titleCase(s?: string | null): string {
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

const DASH = '—';

// ─── LockedField — a read-only field rendered like an input with a lock pill ──

function LockedField({ label, icon, value }: Readonly<{ label: string; icon: IconName; value: string }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  return (
    <View style={styles.lockedWrap}>
      <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>{label}</Text>
      <View style={[styles.lockedBox, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
        <Icon name={icon} size={18} color={colors.text.secondary} />
        <Text style={[styles.lockedValue, { color: colors.text.secondary }]} numberOfLines={1}>{value}</Text>
        <View style={styles.lockedPill}>
          <Icon name="lock" size={12} color={colors.text.disabled} />
          <Text style={[styles.lockedPillText, { color: colors.text.disabled }]}>Locked</Text>
        </View>
      </View>
    </View>
  );
}

// ─── EditButton ───────────────────────────────────────────────────────────────

function EditButton({ editing, onPress }: Readonly<{ editing: boolean; onPress: () => void }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  return (
    <TouchableOpacity style={[editStyles.btn, { gap: sp.xxs }]} hitSlop={8} activeOpacity={0.7} onPress={onPress}>
      {!editing && <Icon name="pencil-outline" size={14} color={colors.text.link} />}
      <Text style={[editStyles.text, { color: colors.text.link, fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.semiBold }]}>
        {editing ? 'Cancel' : 'Edit'}
      </Text>
    </TouchableOpacity>
  );
}

const editStyles = StyleSheet.create({
  btn:  { flexDirection: 'row', alignItems: 'center' },
  text: {},
});


// ─── Screen ───────────────────────────────────────────────────────────────────

export function MyProfileScreen({ navigation }: Readonly<MyProfileProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  const user = useAuthStore(s => s.user);

  // Editable copies of the name fields, seeded from the stored profile.
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName,  setLastName]  = useState(user?.lastName  ?? '');
  // Fields stay read-only (and Save disabled) until the user taps "Edit".
  const [editing,   setEditing]   = useState(false);

  const companyName = user?.associatedCompanies?.[0]?.name ?? DASH;
  const role        = titleCase(user?.role);

  // Toggle edit mode. Cancelling discards any unsaved edits.
  function toggleEdit() {
    if (editing) {
      setFirstName(user?.firstName ?? '');
      setLastName(user?.lastName ?? '');
    }
    setEditing(e => !e);
  }

  function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing details', 'First and last name are required.');
      return;
    }
    setEditing(false);
    // TODO: persist via the profile-update endpoint once it's available.
    Alert.alert('Saved', 'Your profile has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="My profile" titleAlign="left" onBack={() => navigation.goBack()}
        rightElement={<EditButton editing={editing} onPress={toggleEdit} />}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.buttonHeight + sp.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={styles.identity}>
          <Avatar initials={initialsOf(firstName, lastName)} size={64} />
          <Text style={[styles.name, { color: colors.text.primary }]}>
            {[firstName, lastName].filter(Boolean).join(' ') || DASH}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {[role, companyName].filter(Boolean).join(' · ')}
          </Text>
        </View>

        {/* Personal details */}
        <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>PERSONAL DETAILS</Text>

        <AppInput
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          autoCapitalize="words"
          editable={editing}
          inputContainerStyle={editing ? undefined : styles.lockedInput}
        />
        <AppInput
          label="Last name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          autoCapitalize="words"
          editable={editing}
          inputContainerStyle={editing ? undefined : styles.lockedInput}
        />

        <LockedField label="Email address" icon="email-outline" value={user?.email ?? DASH} />
        <LockedField label="Role"          icon="account-outline" value={role || DASH} />

        <View style={styles.note}>
          <Icon name="information-outline" size={14} color={colors.text.secondary} />
          <Text style={[styles.noteText, { color: colors.text.secondary }]}>
            Email and role are managed by your company admin and can't be edited here.
          </Text>
        </View>

        {/* Security */}
        <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>SECURITY</Text>
        <View style={[styles.group, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <SettingsRow
            icon="lock-outline"
            label="Change password"
            onPress={() => navigation.navigate('ChangePassword')}
            isLast
          />
        </View>
      </ScrollView>

      {editing && (
        <WizardFooter>
          <AppButton title="Save changes" onPress={handleSave} style={styles.saveBtn} />
        </WizardFooter>
      )}
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

    identity:  { alignItems: 'center', marginBottom: sp.lg },
    name:      { fontSize: typo.fontSize.xxl, fontWeight: typo.fontWeight.bold, marginTop: sp.sm, marginBottom: sp.xxs },
    subtitle:  { fontSize: typo.fontSize.sm },

    sectionHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.sm,
    },

    // LockedField
    lockedWrap:  { marginBottom: sp.md },
    fieldLabel:  { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.medium, marginBottom: sp.xs },
    lockedBox: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               sp.sm,
      borderWidth:       1,
      borderRadius:      typo.borderRadius.md,
      paddingHorizontal: sp.inputHorizontal,
      height:            sp.inputHeight,
    },
    lockedValue:    { flex: 1, fontSize: typo.fontSize.base },
    lockedPill:     { flexDirection: 'row', alignItems: 'center', gap: sp.xxs },
    lockedPillText: { fontSize: typo.fontSize.xs, fontWeight: typo.fontWeight.medium },

    note:     { flexDirection: 'row', gap: sp.xs, marginTop: -sp.xs, marginBottom: sp.lg },
    noteText: { flex: 1, fontSize: typo.fontSize.xs, lineHeight: typo.lineHeight.tight },

    group: {
      borderWidth:  1,
      borderRadius: typo.borderRadius.lg,
      overflow:     'hidden',
      marginBottom: sp.lg,
    },

    lockedInput: { opacity: 0.5 },

    saveBtn: { flex: 1 },
  });
}
