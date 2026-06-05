import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { NewShippingStep5Props }      from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }               from '../../components/ScreenHeader';
import { AppInput }                   from '../../components/AppInput';
import { AppButton }                  from '../../components/AppButton';
import { StepProgress }               from '../../components/StepProgress';
import { SaveDraftButton }            from '../../components/SaveDraftButton';
import { SavedOptionRow }             from '../../components/SavedOptionRow';
import { InfoBanner }                 from '../../components/InfoBanner';
import { WizardFooter }               from '../../components/WizardFooter';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

const SAVED_PARTIES = [
  { id: '1', name: 'Freight Logistics JA',  used: true,  phone: '',  email: '' },
  { id: '2', name: 'Kingston Motors Ltd.',  used: false, phone: '',  email: '' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingStep5Screen({ navigation }: Readonly<NewShippingStep5Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const [name,  setName]  = useState('Freight Logistics JA');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const styles = makeStyles(sp, typo);

  function fillFromSaved(party: typeof SAVED_PARTIES[0]) {
    setName(party.name);
    setPhone(party.phone);
    setEmail(party.email);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <ScreenHeader
        title="New shipping instruction"
        subtitle="Notify party"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={5} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <InfoBanner>
          A notify party is alerted when the shipment arrives. This step is optional.
        </InfoBanner>

        {/* Saved options */}
        <Text style={[styles.subHeading, { color: colors.text.secondary }]}>
          SAVED OPTIONS
        </Text>
        {SAVED_PARTIES.map(p => (
          <SavedOptionRow key={p.id} name={p.name} used={p.used} onSelect={() => fillFromSaved(p)} />
        ))}

        {/* Manual entry */}
        <Text style={[styles.subHeading, { color: colors.text.secondary, marginTop: sp.lg }]}>
          OR ENTER MANUALLY
        </Text>

        <AppInput
          label="Name"
          placeholder="Notify party name"
          value={name}
          onChangeText={setName}
        />
        <AppInput
          label="Phone"
          placeholder="Notify party phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <AppInput
          label="Email"
          placeholder="Notify party email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Skip link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('NewShippingStep6')}
          hitSlop={8}
          style={styles.skipBtn}
        >
          <Text style={[styles.skipText, { color: colors.text.primary }]}>
            Skip — no notify party
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed bottom — Back + Review */}
      <WizardFooter>
        <AppButton
          title="← Back"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <AppButton
          title="Review →"
          onPress={() => navigation.navigate('NewShippingStep6')}
          style={styles.nextBtn}
        />
      </WizardFooter>
    </KeyboardAvoidingView>
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

    subHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.xs,
    },

    skipBtn:  { alignItems: 'center', paddingVertical: sp.sm, marginTop: sp.xs },
    skipText: { fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.medium },

    backBtn: { flex: 1 },
    nextBtn: { flex: 2 },
  });
}
