import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { PreferencesProps }        from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { SettingsRow }             from '../../components/SettingsRow';
import { OptionPickerSheet, PickerOption } from '../../components/OptionPickerSheet';

// ─── General-preference options ───────────────────────────────────────────────
// `value` is API-friendly; `label` is what the user sees in the row + sheet.

const LANGUAGES: PickerOption[] = [
  { label: 'English (CA)',    value: 'en-CA' },
  { label: 'English (US)',    value: 'en-US' },
  { label: 'French (CA)',     value: 'fr-CA' },
  { label: 'Spanish',         value: 'es' },
  { label: 'Portuguese (BR)', value: 'pt-BR' },
];

const CURRENCIES: PickerOption[] = [
  { label: 'CAD $', value: 'CAD', description: 'Canadian dollar' },
  { label: 'USD $', value: 'USD', description: 'US dollar' },
  { label: 'EUR €', value: 'EUR', description: 'Euro' },
  { label: 'GBP £', value: 'GBP', description: 'Pound sterling' },
  { label: 'JMD $', value: 'JMD', description: 'Jamaican dollar' },
  { label: 'NGN ₦', value: 'NGN', description: 'Nigerian naira' },
];

const UNITS: PickerOption[] = [
  { label: 'Metric (kg)',   value: 'metric',   description: 'Kilograms, centimetres' },
  { label: 'Imperial (lb)', value: 'imperial', description: 'Pounds, inches' },
];

const DATE_FORMATS: PickerOption[] = [
  { label: 'DD MMM YYYY', value: 'DD MMM YYYY', description: '06 Jun 2026' },
  { label: 'MM/DD/YYYY',  value: 'MM/DD/YYYY',  description: '06/06/2026' },
  { label: 'DD/MM/YYYY',  value: 'DD/MM/YYYY',  description: '06/06/2026' },
  { label: 'YYYY-MM-DD',  value: 'YYYY-MM-DD',  description: '2026-06-06' },
];

type PickerKey = 'language' | 'currency' | 'units' | 'dateFormat';

// ─── Screen ───────────────────────────────────────────────────────────────────

export function PreferencesScreen({ navigation }: Readonly<PreferencesProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  // General preferences — these states are what we'll send to the API later.
  const [language,   setLanguage]   = useState<PickerOption>(LANGUAGES[0]);
  const [currency,   setCurrency]   = useState<PickerOption>(CURRENCIES[0]);
  const [units,      setUnits]      = useState<PickerOption>(UNITS[0]);
  const [dateFormat, setDateFormat] = useState<PickerOption>(DATE_FORMATS[0]);

  // Which picker sheet is currently open (null = none)
  const [openPicker, setOpenPicker] = useState<PickerKey | null>(null);

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
          <SettingsRow iconTile icon="translate"             label="Language"          value={language.label}   onPress={() => setOpenPicker('language')} />
          <SettingsRow iconTile icon="file-document-outline" label="Currency"          value={currency.label}   onPress={() => setOpenPicker('currency')} />
          <SettingsRow iconTile icon="layers-outline"        label="Measurement units" value={units.label}      onPress={() => setOpenPicker('units')} />
          <SettingsRow iconTile icon="calendar-outline"      label="Date format"       value={dateFormat.label} onPress={() => setOpenPicker('dateFormat')} isLast />
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

      {/* Selection sheets */}
      <OptionPickerSheet
        visible={openPicker === 'language'}
        title="Language"
        options={LANGUAGES}
        selectedValue={language.value}
        onSelect={setLanguage}
        onClose={() => setOpenPicker(null)}
      />
      <OptionPickerSheet
        visible={openPicker === 'currency'}
        title="Currency"
        options={CURRENCIES}
        selectedValue={currency.value}
        onSelect={setCurrency}
        onClose={() => setOpenPicker(null)}
      />
      <OptionPickerSheet
        visible={openPicker === 'units'}
        title="Measurement units"
        options={UNITS}
        selectedValue={units.value}
        onSelect={setUnits}
        onClose={() => setOpenPicker(null)}
      />
      <OptionPickerSheet
        visible={openPicker === 'dateFormat'}
        title="Date format"
        options={DATE_FORMATS}
        selectedValue={dateFormat.value}
        onSelect={setDateFormat}
        onClose={() => setOpenPicker(null)}
      />
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
