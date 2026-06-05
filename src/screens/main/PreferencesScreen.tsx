import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { PreferencesProps }        from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { SettingsRow }             from '../../components/SettingsRow';

// ─── Screen ───────────────────────────────────────────────────────────────────

export function PreferencesScreen({ navigation }: Readonly<PreferencesProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  const [push,   setPush]   = useState(true);
  const [email,  setEmail]  = useState(true);
  const [sms,    setSms]    = useState(false);
  const [status, setStatus] = useState(true);
  const [docs,   setDocs]   = useState(true);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <ScreenHeader
        title="Preferences"
        titleAlign="left"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + sp.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* General */}
        <Text style={[styles.heading, { color: colors.text.secondary }]}>GENERAL</Text>
        <View style={[styles.group, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <SettingsRow iconTile icon="translate"         label="Language"          value="English (CA)"  onPress={() => {}} />
          <SettingsRow iconTile icon="file-document-outline" label="Currency"      value="CAD $"          onPress={() => {}} />
          <SettingsRow iconTile icon="layers-outline"    label="Measurement units" value="Metric (kg)"    onPress={() => {}} />
          <SettingsRow iconTile icon="calendar-outline"  label="Date format"       value="DD MMM YYYY"    onPress={() => {}} isLast />
        </View>

        {/* Notification channels */}
        <Text style={[styles.heading, { color: colors.text.secondary }]}>NOTIFICATION CHANNELS</Text>
        <View style={[styles.group, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <SettingsRow iconTile icon="bell-outline"  label="Push notifications" sublabel="On this device"     toggle={{ value: push,  onValueChange: setPush }} />
          <SettingsRow iconTile icon="chat-outline"  label="Email"              sublabel="ops@acmeexports.com" toggle={{ value: email, onValueChange: setEmail }} />
          <SettingsRow iconTile icon="file-document-outline" label="SMS"         sublabel="+1-416-555-0100"    toggle={{ value: sms,   onValueChange: setSms }} isLast />
        </View>

        {/* Notify me about */}
        <Text style={[styles.heading, { color: colors.text.secondary }]}>NOTIFY ME ABOUT</Text>
        <View style={[styles.group, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <SettingsRow iconTile icon="refresh"      label="Shipment status changes"      toggle={{ value: status, onValueChange: setStatus }} />
          <SettingsRow iconTile icon="chat-outline" label="New messages from docs team"  toggle={{ value: docs,   onValueChange: setDocs }} isLast />
        </View>

        {/* Appearance */}
        <Text style={[styles.heading, { color: colors.text.secondary }]}>APPEARANCE</Text>
        <View style={[styles.group, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <SettingsRow iconTile icon="cog-outline" label="Theme" value="Dark" onPress={() => {}} isLast />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },

    heading: {
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
  });
}
