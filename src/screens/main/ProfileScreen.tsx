import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets }              from 'react-native-safe-area-context';
import { useColors, useSpacing, useTypography } from '../../theme';
import { Icon }                           from '../../components/Icon';
import { Avatar }                         from '../../components/Avatar';
import { SettingsRow }                    from '../../components/SettingsRow';
import { BottomNavBar, BOTTOM_NAV_HEIGHT } from '../../components/BottomNavBar';

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  const [biometric, setBiometric] = useState(true);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + sp.xs }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Company profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Icon name="bell-outline" size={24} color={colors.text.primary} />
            <View style={[styles.bellDot, { backgroundColor: colors.error.main, borderColor: colors.background.default }]} />
          </TouchableOpacity>
          <Avatar initials="AE" size={36} />
        </View>
      </View>

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
          <SettingsRow icon="office-building-outline" label="Company details" onPress={() => {}} />
          <SettingsRow icon="office-building-outline" label="Saved parties (3)" onPress={() => {}} />
          <SettingsRow icon="file-document-outline"  label="Tax & compliance IDs" onPress={() => {}} isLast />
        </View>

        {/* Settings group */}
        <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>SETTINGS</Text>
        <View style={[styles.group, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <SettingsRow icon="bell-outline" label="Notifications" onPress={() => {}} />
          <SettingsRow
            icon="fingerprint"
            label="Biometric sign-in"
            toggle={{ value: biometric, onValueChange: setBiometric }}
          />
          <SettingsRow icon="cog-outline" label="Preferences" onPress={() => {}} isLast />
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

    header: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      paddingHorizontal: sp.screenHorizontal,
      paddingBottom:     sp.sm,
    },
    headerTitle: { fontSize: typo.fontSize.xxl, fontWeight: typo.fontWeight.bold },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
    bellBtn:     { padding: sp.xxs },
    bellDot: {
      position:     'absolute',
      top:          4,
      right:        4,
      width:        9,
      height:       9,
      borderRadius: 5,
      borderWidth:  1.5,
    },

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
