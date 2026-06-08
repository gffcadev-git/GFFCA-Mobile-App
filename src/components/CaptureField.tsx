import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { AppInput } from './AppInput';
import { Icon } from './Icon';

type Props = Readonly<{
  /** Section heading shown above the capture buttons */
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  /** Helper/hint text shown under the manual input */
  helperText?: string;
  /** Shows the green "Parsed from photo" badge once a value is present */
  parsedBadge?: boolean;
}>;

/**
 * "Take photo / Upload image" capture buttons above a manual text input.
 * Used wherever a field can be filled from a photo OCR or typed by hand
 * (container & seal numbers, VINs, …). The input border turns green once
 * a value is present.
 */
export function CaptureField({
  label, required, value, onChangeText, placeholder, helperText, parsedBadge,
}: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  const filled = value.trim().length > 0;

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
        helperText={helperText}
        style={{ color: filled ? colors.success.main : colors.text.primary }}
        inputContainerStyle={filled ? { borderColor: colors.success.main } : undefined}
      />

      {/* "Parsed from photo" badge */}
      {!!parsedBadge && filled && (
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

function makeStyles(
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
      gap:               sp.xxs,
      paddingHorizontal: sp.xs,
      paddingVertical:   sp.xxxs,
      borderRadius:      typo.borderRadius.full,
    },
    parsedText: { fontSize: typo.fontSize.xs, fontWeight: typo.fontWeight.semiBold },
    parsedHint: { fontSize: typo.fontSize.xs },
  });
}
