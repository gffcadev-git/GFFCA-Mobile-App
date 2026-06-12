import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { NewShippingStep3Props }      from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }               from '../../components/ScreenHeader';
import { AppInput }                   from '../../components/AppInput';
import { AppButton }                  from '../../components/AppButton';
import { StepProgress }               from '../../components/StepProgress';
import { SaveDraftButton }            from '../../components/SaveDraftButton';
import { SavedOptionRow }             from '../../components/SavedOptionRow';
import { WizardFooter }               from '../../components/WizardFooter';
import { useSiDraftStore }            from '../../stores/siDraftStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

const SAVED_SHIPPERS = [
  { id: '1', name: 'Acme Exports Inc.',   used: true  },
  { id: '2', name: 'West Coast Shippers', used: false },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingStep3Screen({ navigation }: Readonly<NewShippingStep3Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const form    = useSiDraftStore(s => s.form);
  const setForm = useSiDraftStore(s => s.setForm);

  const styles = makeStyles(sp, typo);

  function fillFromSaved(shipper: typeof SAVED_SHIPPERS[0]) {
    if (shipper.name === 'Acme Exports Inc.') {
      setForm({
        shipperName:  shipper.name,
        shipperPhone: '+1-416-555-0100',
        shipperEmail: 'ops@acmeexports.com',
        shipperTaxId: 'CA-872 445 109',
      });
    } else {
      setForm({ shipperName: shipper.name, shipperPhone: '', shipperEmail: '', shipperTaxId: '' });
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <ScreenHeader
        title={form.ref ?? 'New shipping instruction'}
        subtitle="Parties"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={3} />

      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Shipper section ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Shipper</Text>
          <View style={[styles.requiredBadge, { backgroundColor: colors.error.dark }]}>
            <Text style={[styles.requiredText, { color: colors.error.contrastText }]}>required</Text>
          </View>
        </View>

        {/* Saved options */}
        <Text style={[styles.subHeading, { color: colors.text.secondary }]}>
          SAVED OPTIONS
        </Text>
        {SAVED_SHIPPERS.map(s => (
          <SavedOptionRow key={s.id} name={s.name} used={s.used} onSelect={() => fillFromSaved(s)} />
        ))}

        {/* Manual entry */}
        <Text style={[styles.subHeading, { color: colors.text.secondary, marginTop: sp.lg }]}>
          OR ENTER MANUALLY
        </Text>

        <AppInput
          label="Name"
          required
          placeholder="Company or person name"
          value={form.shipperName}
          onChangeText={t => setForm({ shipperName: t })}
        />
        <AppInput
          label="Phone"
          required
          placeholder="+1-000-000-0000"
          keyboardType="phone-pad"
          value={form.shipperPhone}
          onChangeText={t => setForm({ shipperPhone: t })}
        />
        <AppInput
          label="Email"
          required
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.shipperEmail}
          onChangeText={t => setForm({ shipperEmail: t })}
        />
        <AppInput
          label="Tax ID"
          placeholder="e.g. CA-872 445 109"
          value={form.shipperTaxId}
          onChangeText={t => setForm({ shipperTaxId: t })}
        />
        <AppInput
          label="Address"
          placeholder="Street, city, country"
          value={form.shipperAddress}
          onChangeText={t => setForm({ shipperAddress: t })}
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
          onPress={() => navigation.navigate('NewShippingStep4')}
          disabled={!form.shipperName.trim() || !form.shipperPhone.trim() || !form.shipperEmail.trim()}
          style={styles.nextBtn}
        />
      </WizardFooter>
    </View>
  );
}

// ─── Screen styles ─────────────────────────────────────────────────────────────

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },

    sectionHeader: {
      flexDirection:  'row',
      alignItems:     'center',
      gap:            sp.xs,
      marginBottom:   sp.sm,
    },
    sectionTitle: {
      fontSize:   typo.fontSize.xl,
      fontWeight: typo.fontWeight.semiBold,
    },
    requiredBadge: {
      paddingHorizontal: sp.xs,
      paddingVertical:   sp.xxxs,
      borderRadius:      typo.borderRadius.full,
    },
    requiredText: {
      fontSize:   typo.fontSize.xs,
      fontWeight: typo.fontWeight.semiBold,
    },

    subHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.xs,
    },

    backBtn: { flex: 1 },
    nextBtn: { flex: 2 },
  });
}
