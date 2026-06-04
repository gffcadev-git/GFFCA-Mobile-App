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
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { NewShippingStep2Props }      from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }               from '../../components/ScreenHeader';
import { AppInput }                   from '../../components/AppInput';
import { AppButton }                  from '../../components/AppButton';
import { StepProgress }               from '../../components/StepProgress';
import { SaveDraftButton }            from '../../components/SaveDraftButton';
import { Icon }                       from '../../components/Icon';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

// ─── CaptureField ─────────────────────────────────────────────────────────────
// Reusable within this screen: photo + upload buttons above a manual text input.

type CaptureFieldProps = {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  parsedBadge?: boolean;
};

function CaptureField({
  label, required, value, onChangeText, placeholder, parsedBadge,
}: Readonly<CaptureFieldProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeCaptureStyles(sp, typo);

  return (
    <View style={styles.section}>
      {/* Section label */}
      <Text style={[styles.sectionLabel, { color: colors.text.primary }]}>
        {label}
        {required && <Text style={{ color: colors.error.main }}> *</Text>}
      </Text>

      {/* Photo / upload button row */}
      <View style={styles.captureRow}>
        <TouchableOpacity
          style={[styles.captureBtn, { backgroundColor: colors.background.paper, borderColor: colors.border }]}
          activeOpacity={0.75}
        >
          <Icon name="camera-outline" size={22} color={colors.text.primary} />
          <Text style={[styles.captureBtnTitle, { color: colors.text.primary }]}>Take photo</Text>
          <Text style={[styles.captureBtnSub,   { color: colors.text.secondary }]}>Opens camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureBtn, { backgroundColor: colors.background.paper, borderColor: colors.border }]}
          activeOpacity={0.75}
        >
          <Icon name="tray-arrow-up" size={22} color={colors.text.primary} />
          <Text style={[styles.captureBtnTitle, { color: colors.text.primary }]}>Upload image</Text>
          <Text style={[styles.captureBtnSub,   { color: colors.text.secondary }]}>From gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Manual input divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.text.secondary }]}>or type manually</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Text input — no label (section heading serves as label).
          Border turns green once a value is present. */}
      <AppInput
        label=""
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={{ color: value.trim() ? colors.success.main : colors.text.primary }}
        inputContainerStyle={value.trim() ? { borderColor: colors.success.main } : undefined}
      />

      {/* "Parsed from photo" badge */}
      {!!parsedBadge && value.trim().length > 0 && (
        <View style={styles.parsedRow}>
          <View style={[styles.parsedBadge, { backgroundColor: colors.success.dark }]}>
            <Icon name="check" size={11} color={colors.success.contrastText} />
            <Text style={[styles.parsedText, { color: colors.success.contrastText }]}>
              Parsed from photo
            </Text>
          </View>
          <Text style={[styles.parsedHint, { color: colors.text.secondary }]}>
            Confirm or correct above
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingStep2Screen({ navigation }: Readonly<NewShippingStep2Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const insets = useSafeAreaInsets();

  const [containerNumber, setContainerNumber] = useState('MSCU 123 456 7');
  const [sealNumber,      setSealNumber]      = useState('');

  const styles = makeStyles(sp);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <ScreenHeader
        title="New shipping instruction"
        subtitle="Container & seal"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={2} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CaptureField
          label="Container number"
          required
          value={containerNumber}
          onChangeText={setContainerNumber}
          placeholder="e.g. MSCU 123 456 7"
          parsedBadge
        />

        <CaptureField
          label="Seal number"
          required
          value={sealNumber}
          onChangeText={setSealNumber}
          placeholder="Seal number..."
        />
      </ScrollView>

      {/* Fixed bottom — Back + Next */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + sp.sm, backgroundColor: colors.background.default }]}>
        <View style={styles.footerRow}>
          <AppButton
            title="← Back"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          />
          <AppButton
            title="Next →"
            onPress={() => navigation.navigate('NewShippingStep3')}
            disabled={!containerNumber.trim()}
            style={styles.nextBtn}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeCaptureStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    section:      { marginBottom: sp.lg },
    sectionLabel: {
      fontSize:     typo.fontSize.base,
      fontWeight:   typo.fontWeight.semiBold,
      marginBottom: sp.sm,
    },

    captureRow: {
      flexDirection: 'row',
      gap:           sp.sm,
      marginBottom:  sp.sm,
    },
    captureBtn: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
      paddingVertical: sp.md,
      borderWidth:    1,
      borderRadius:   typo.borderRadius.md,
      gap:            sp.xxs,
    },
    captureBtnTitle: {
      fontSize:   typo.fontSize.sm,
      fontWeight: typo.fontWeight.semiBold,
    },
    captureBtnSub: {
      fontSize: typo.fontSize.xs,
    },

    dividerRow: {
      flexDirection: 'row',
      alignItems:    'center',
      marginBottom:  sp.sm,
      gap:           sp.sm,
    },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontSize: typo.fontSize.xs },

    parsedRow:  { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: -sp.xs },
    parsedBadge: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               4,
      paddingHorizontal: sp.xs,
      paddingVertical:   3,
      borderRadius:      typo.borderRadius.full,
    },
    parsedText: { fontSize: typo.fontSize.xs, fontWeight: typo.fontWeight.semiBold },
    parsedHint: { fontSize: typo.fontSize.xs },
  });
}

function makeStyles(sp: ReturnType<typeof useSpacing>) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },

    footer: {
      position:          'absolute',
      bottom:            0,
      left:              0,
      right:             0,
      paddingHorizontal: sp.screenHorizontal,
      paddingTop:        sp.sm,
    },
    footerRow: {
      flexDirection: 'row',
      gap:           sp.sm,
    },
    backBtn: { flex: 1 },
    nextBtn: { flex: 2 },
  });
}
