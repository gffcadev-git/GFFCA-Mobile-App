import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

  const [name,    setName]    = useState('Acme Exports Inc.');
  const [phone,   setPhone]   = useState('+1-416-555-0100');
  const [email,   setEmail]   = useState('ops@acmeexports.com');
  const [taxId,   setTaxId]   = useState('CA-872 445 109');
  const [address, setAddress] = useState('');

  const styles = makeStyles(sp, typo);

  function fillFromSaved(shipper: typeof SAVED_SHIPPERS[0]) {
    if (shipper.name === 'Acme Exports Inc.') {
      setName(shipper.name);
      setPhone('+1-416-555-0100');
      setEmail('ops@acmeexports.com');
      setTaxId('CA-872 445 109');
    } else {
      setName(shipper.name);
      setPhone('');
      setEmail('');
      setTaxId('');
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <ScreenHeader
        title="New shipping instruction"
        subtitle="Parties"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={3} />

      <ScrollView
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
          value={name}
          onChangeText={setName}
        />
        <AppInput
          label="Phone"
          required
          placeholder="+1-000-000-0000"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <AppInput
          label="Email"
          required
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <AppInput
          label="Tax ID"
          placeholder="e.g. CA-872 445 109"
          value={taxId}
          onChangeText={setTaxId}
        />
        <AppInput
          label="Address"
          placeholder="Street, city, country"
          value={address}
          onChangeText={setAddress}
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
          onPress={() => navigation.navigate('NewShippingStep4')}
          disabled={!name.trim() || !phone.trim() || !email.trim()}
          style={styles.nextBtn}
        />
      </WizardFooter>
    </KeyboardAvoidingView>
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
