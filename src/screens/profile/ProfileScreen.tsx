import React, { useState, useEffect } from 'react';
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
import { enrollBiometric, disableBiometric, hasBiometricLogin } from '../../services/biometricCredentials';
import { useAuthStore }                    from '../../stores/authStore';
import { useDraftStore }                   from '../../stores/draftStore';
import { api }                             from '../../apiCall';
import { queryClient, queryPersister }     from '../../services/queryClient';

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
  const refreshToken              = useAuthStore(s => s.refreshToken);
  const signOut                   = useAuthStore(s => s.signOut);

  // Single source of truth: whether a biometric login credential is enrolled in
  // the Keychain. Both platform rows (Face ID / fingerprint) reflect this one
  // entry, since the OS scan unlocks the same stored credential.
  const [bioEnabled, setBioEnabled] = useState(false);
  useEffect(() => {
    hasBiometricLogin().then(setBioEnabled);
  }, []);

  // Enabling stores the current refresh token behind the biometric sensor;
  // disabling clears that entry.
  async function toggleBiometric(next: boolean) {
    if (!next) {
      await disableBiometric();
      setBioEnabled(false);
      return;
    }
    if (!refreshToken) {
      Alert.alert('Not available', 'Please sign in again before enabling biometric sign-in.');
      return;
    }
    // Prove the user can pass biometrics before we rely on it for sign-in.
    const ok = await authenticate('Confirm to enable biometric sign-in');
    if (!ok) {
      Alert.alert('Could not enable', 'Biometric verification was not completed.');
      return;
    }
    try {
      await enrollBiometric(refreshToken);
      setBioEnabled(true);
    } catch {
      Alert.alert('Could not enable', 'Unable to securely store your biometric login.');
    }
  }

  // Full sign-out: best-effort server revoke, then wipe every local trace —
  // session + biometric tokens, saved drafts, and the cached API data.
  async function handleSignOut() {
    try {
      await api.auth.logout();              // revoke server-side; ignore offline / already-expired
    } catch {
      // best-effort — proceed with local teardown regardless
    }
    await signOut({ wipeBiometric: true }); // clears Keychain session + biometric tokens, flips auth state
    useDraftStore.getState().clear();       // drop saved shipping drafts (gffca-drafts)
    queryClient.clear();                    // drop in-memory React Query cache
    await queryPersister.removeClient();    // drop persisted cache (gffca-react-query-cache)
  }

  function confirmSignOut() {
    Alert.alert('Sign out', "You'll need to sign in again to use the app.", [
      { text: 'Cancel',   style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: handleSignOut },
    ]);
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

        {/* Shipping group */}
        <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>SHIPPING</Text>
        <View style={[styles.group, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <SettingsRow icon="pencil-outline" label="Draft Shipping Instructionss" onPress={() => navigation.navigate('DraftShippingInstructions')} isLast />
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
                value:         bioEnabled,
                onValueChange: toggleBiometric,
              }}
            />
          ))}

          <SettingsRow icon="cog-outline" label="Preferences" onPress={() => navigation.navigate('Preferences')} isLast />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOut} activeOpacity={0.7} onPress={confirmSignOut}>
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
    profileName: { fontSize: typo.fontSize.xl, fontWeight: typo.fontWeight.bold, marginBottom: sp.xxxs },
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
