import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { NewShippingStep2Props }      from '../../navigation/types';
import { useColors, useSpacing }      from '../../theme';
import { ScreenHeader }               from '../../components/ScreenHeader';
import { AppButton }                  from '../../components/AppButton';
import { StepProgress }               from '../../components/StepProgress';
import { SaveDraftButton }            from '../../components/SaveDraftButton';
import { CaptureField }               from '../../components/CaptureField';
import { WizardFooter }               from '../../components/WizardFooter';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

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
          disabled={!containerNumber.trim()}
          style={styles.nextBtn}
        />
      </WizardFooter>
    </KeyboardAvoidingView>
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
