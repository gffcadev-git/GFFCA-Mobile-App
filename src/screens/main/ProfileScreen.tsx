import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets }              from 'react-native-safe-area-context';
import { useNavigation }                  from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors, useSpacing, useTypography } from '../../theme';
import type { MainStackParamList }        from '../../navigation/types';
import { Avatar }                         from '../../components/Avatar';
import { SettingsRow }                    from '../../components/SettingsRow';
import { TabHeader }                      from '../../components/TabHeader';
import { BottomNavBar, BOTTOM_NAV_HEIGHT } from '../../components/BottomNavBar';
import { useBiometrics }                  from '../../services/biometrics';

// ─── Screen ───────────────────────────────────────────────────────────────────

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function ProfileScreen() {
  const colors     = useColors();
  const sp         = useSpacing();
  const typo       = useTypography();
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const styles     = makeStyles(sp, typo);

  const { methods, authenticate } = useBiometrics();

  // One enabled-state per biometric method shown on this platform.
  const [fingerprintOn, setFingerprintOn] = useState(false);
  const [faceIdOn,      setFaceIdOn]       = useState(false);

  const methodState: Record<'fingerprint' | 'faceid', { value: boolean; set: (v: boolean) => void }> = {
    fingerprint: { value: fingerprintOn, set: setFingerprintOn },
    faceid:      { value: faceIdOn,      set: setFaceIdOn },
  };

  // Enabling requires a successful biometric scan; disabling is immediate.
  async function toggleBiometric(method: 'fingerprint' | 'faceid', next: boolean) {
    const { set } = methodState[method];
    if (!next) {
      set(false);
      return;
    }
    const label = method === 'faceid' ? 'Face ID' : 'fingerprint';
    const ok = await authenticate(`Confirm ${label} to enable biometric sign-in`);
    if (ok) {
      set(true);
    } else {
      Alert.alert('Could not enable', `${label} verification was not completed.`);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <TabHeader
        title="Company profile"
        avatarInitials="AE"
        onBellPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + sp.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <Avatar initials="AE" size={56} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text.primary }]}>Acme Exports Inc.</Text>
            <Text style={[styles.profileRole, { color: colors.text.secondary }]}>James O. · Operations</Text>
          </View>
        </View>

        {/* Company profile group */}
        <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>COMPANY PROFILE</Text>
        <View style={[styles.group, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <SettingsRow icon="office-building-outline" label="Company details" onPress={() => navigation.navigate('CompanyDetails')} />
          <SettingsRow icon="office-building-outline" label="Saved parties (3)" onPress={() => navigation.navigate('SavedParties')} />
          <SettingsRow icon="file-document-outline"  label="Tax & compliance IDs" onPress={() => navigation.navigate('TaxCompliance')} isLast />
        </View>

        {/* Settings group */}
        <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>SETTINGS</Text>
        <View style={[styles.group, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <SettingsRow icon="bell-outline" label="Notifications" onPress={() => {}} />

          {/* Biometric sign-in — iOS: Face ID only · Android: Biometric + Face ID */}
          {methods.map(method => (
            <SettingsRow
              key={method}
              icon={method === 'faceid' ? 'face-recognition' : 'fingerprint'}
              label={method === 'faceid' ? 'Face ID' : 'Biometric'}
              toggle={{
                value:         methodState[method].value,
                onValueChange: next => toggleBiometric(method, next),
              }}
            />
          ))}

          <SettingsRow icon="cog-outline" label="Preferences" onPress={() => navigation.navigate('Preferences')} isLast />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOut} activeOpacity={0.7}>
          <Text style={[styles.signOutText, { color: colors.error.main }]}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar activeTab="Profile" messageBadge={2} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root: { flex: 1 },

    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.xs },

    profileCard: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           sp.md,
      borderWidth:   1,
      borderRadius:  typo.borderRadius.lg,
      padding:       sp.md,
      marginBottom:  sp.lg,
    },
    profileInfo: { flex: 1 },
    profileName: { fontSize: typo.fontSize.xl, fontWeight: typo.fontWeight.bold, marginBottom: 2 },
    profileRole: { fontSize: typo.fontSize.sm },

    sectionHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.xs,
    },
    group: {
      borderWidth:  1,
      borderRadius: typo.borderRadius.lg,
      overflow:     'hidden',
      marginBottom: sp.lg,
    },

    signOut:     { alignItems: 'center', paddingVertical: sp.sm, marginTop: sp.xs },
    signOutText: { fontSize: typo.fontSize.lg, fontWeight: typo.fontWeight.bold },
  });
}
