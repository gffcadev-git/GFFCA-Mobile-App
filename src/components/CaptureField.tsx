import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { AppInput } from './AppInput';
import { Icon, type IconName } from './Icon';
import { OcrCameraModal } from './OcrCameraModal';
import { pickImageAndRecognize } from '../services/ocrService';

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
  /** Live validation result shown as a coloured line under the input. */
  status?: { state: 'valid' | 'invalid' | 'warning'; message: string };
  /**
   * Turns OCR text into the structured field value. Return null when nothing
   * matched so the user is told to retry / type it. When omitted, the raw OCR
   * text is used as-is.
   */
  parse?: (ocrText: string) => string | null;
  /** Instruction shown over the camera frame, e.g. "Scan the VIN". */
  scanPrompt?: string;
}>;

/**
 * "Take photo / Upload image" capture buttons above a manual text input.
 * Used wherever a field can be filled from a photo OCR or typed by hand
 * (container & seal numbers, VINs, …). The input border turns green once
 * a value is present.
 */
export function CaptureField({
  label, required, value, onChangeText, placeholder, helperText, parsedBadge, status,
  parse, scanPrompt,
}: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  const filled = value.trim().length > 0;

  const [cameraOpen, setCameraOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Apply OCR text: parse to the structured value, else tell the user to retry.
  const applyOcr = (text: string) => {
    const parsed = parse ? parse(text) : text.trim();
    if (parsed) {
      setScanError(null);
      onChangeText(parsed);
    } else {
      setScanError("Couldn't read a valid value — try again or type it below.");
    }
  };

  const onUpload = async () => {
    if (picking) return;
    setScanError(null);
    setPicking(true);
    try {
      const text = await pickImageAndRecognize();
      if (text != null) applyOcr(text);
    } catch {
      setScanError('Could not read that image. Try another or type it below.');
    } finally {
      setPicking(false);
    }
  };

  // Accent colour for the input border/text. When validation is supplied it
  // wins; otherwise fall back to "green once filled".
  const stateColors = {
    valid:   colors.success.main,
    invalid: colors.error.main,
    warning: colors.warning.main,
  };
  const stateIcons: Record<'valid' | 'invalid' | 'warning', IconName> = {
    valid:   'check',
    invalid: 'alert-circle-outline',
    warning: 'alert-outline',
  };
  let accentColor: string | undefined;
  if (status) accentColor = stateColors[status.state];
  else if (filled) accentColor = colors.success.main;

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
          onPress={() => { setScanError(null); setCameraOpen(true); }}
          disabled={picking}
        >
          <Icon name="camera-outline" size={22} color={colors.text.primary} />
          <Text style={[styles.captureBtnTitle, { color: colors.text.primary }]}>Take photo</Text>
          <Text style={[styles.captureBtnSub,   { color: colors.text.secondary }]}>Opens camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureBtn, { backgroundColor: colors.background.paper, borderColor: colors.border }]}
          activeOpacity={0.75}
          onPress={onUpload}
          disabled={picking}
        >
          {picking
            ? <ActivityIndicator color={colors.text.primary} />
            : <Icon name="tray-arrow-up" size={22} color={colors.text.primary} />}
          <Text style={[styles.captureBtnTitle, { color: colors.text.primary }]}>Upload image</Text>
          <Text style={[styles.captureBtnSub,   { color: colors.text.secondary }]}>
            {picking ? 'Reading…' : 'From gallery'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scan failure hint */}
      {!!scanError && (
        <View style={styles.statusRow}>
          <Icon name="alert-outline" size={13} color={colors.warning.main} />
          <Text style={[styles.statusText, { color: colors.warning.main }]}>{scanError}</Text>
        </View>
      )}

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
        style={{ color: accentColor ?? colors.text.primary }}
        inputContainerStyle={accentColor ? { borderColor: accentColor } : undefined}
      />

      {/* Validation status line */}
      {!!status && filled && (
        <View style={styles.statusRow}>
          <Icon name={stateIcons[status.state]} size={13} color={stateColors[status.state]} />
          <Text style={[styles.statusText, { color: stateColors[status.state] }]}>
            {status.message}
          </Text>
        </View>
      )}

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

      {/* Camera capture sheet */}
      <OcrCameraModal
        visible={cameraOpen}
        prompt={scanPrompt ?? `Scan the ${label.toLowerCase()}`}
        onClose={() => setCameraOpen(false)}
        onCapture={applyOcr}
      />
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

    statusRow:  { flexDirection: 'row', alignItems: 'center', gap: sp.xxs, marginTop: -sp.xs, marginBottom: sp.xs },
    statusText: { fontSize: typo.fontSize.xs, fontWeight: typo.fontWeight.medium, flex: 1 },

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
