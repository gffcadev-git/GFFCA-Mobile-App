import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { NewShippingStep2Props }      from '../../navigation/types';
import { useColors, useSpacing }      from '../../theme';
import { ScreenHeader }               from '../../components/ScreenHeader';
import { AppButton }                  from '../../components/AppButton';
import { StepProgress }               from '../../components/StepProgress';
import { SaveDraftButton }            from '../../components/SaveDraftButton';
import { CaptureField }               from '../../components/CaptureField';
import { WizardFooter }               from '../../components/WizardFooter';
import { useSiDraftStore }            from '../../stores/siDraftStore';
import {
  validateContainerNumber,
  isValidSealFormat,
  extractContainerNumber,
  extractSealNumber,
  type ContainerValidation,
}                                     from '../../services/fieldExtractorService';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

type FieldStatus = { state: 'valid' | 'invalid' | 'warning'; message: string } | undefined;

/** Map a container validation result to the CaptureField status line. */
function containerStatusFor(raw: string, v: ContainerValidation): FieldStatus {
  if (!raw.trim()) return undefined;
  if (v.valid) {
    return { state: 'valid', message: `Valid ISO 6346 · check digit ${v.canonical!.slice(-1)}` };
  }
  if (v.expectedCheckDigit) {
    return { state: 'invalid', message: `Check digit fails — expected ${v.expectedCheckDigit}` };
  }
  return { state: 'invalid', message: 'Not a valid container number (AAAA NNNNNN C)' };
}

/** Map a seal value to the CaptureField status line (format-only, no checksum). */
function sealStatusFor(raw: string): FieldStatus {
  if (!raw.trim()) return undefined;
  if (isValidSealFormat(raw)) return { state: 'valid', message: 'Seal format looks right' };
  return { state: 'warning', message: 'Unusual format — confirm the seal number' };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingStep2Screen({ navigation }: Readonly<NewShippingStep2Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const insets = useSafeAreaInsets();

  const form    = useSiDraftStore(s => s.form);
  const setForm = useSiDraftStore(s => s.setForm);

  const styles = makeStyles(sp);

  // ── Live validation (ISO 6346 container + seal format) ──
  const container = validateContainerNumber(form.containerNumber);
  const containerStatus = containerStatusFor(form.containerNumber, container);
  const sealStatus = sealStatusFor(form.sealNumber);
  const canContinue = container.valid;

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <ScreenHeader
        title={form.ref ?? 'New shipping instruction'}
        subtitle="Container & seal"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={2} />

      <KeyboardAwareScrollView
        bottomOffset={24}
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
          value={form.containerNumber}
          onChangeText={t => setForm({ containerNumber: t })}
          placeholder="e.g. MSCU 123 456 7"
          parsedBadge
          status={containerStatus}
          parse={extractContainerNumber}
          scanPrompt="Scan the container number"
        />

        <CaptureField
          label="Seal number"
          required
          value={form.sealNumber}
          onChangeText={t => setForm({ sealNumber: t })}
          placeholder="Seal number..."
          status={sealStatus}
          parse={extractSealNumber}
          scanPrompt="Scan the seal number"
        />
      </KeyboardAwareScrollView>

      {/* Fixed bottom — Back + Next */}
      <WizardFooter>
        <AppButton
          title="← Back"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <AppButton
          title="Next →"
          onPress={() => navigation.navigate('NewShippingStep3')}
          disabled={!canContinue}
          style={styles.nextBtn}
        />
      </WizardFooter>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(sp: ReturnType<typeof useSpacing>) {
  return StyleSheet.create({
    root:    { flex: 1 },
    scroll:  { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },
    backBtn: { flex: 1 },
    nextBtn: { flex: 2 },
  });
}
