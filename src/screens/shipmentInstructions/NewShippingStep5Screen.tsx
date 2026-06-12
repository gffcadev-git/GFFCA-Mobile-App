import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
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
import { useSiDraftStore }            from '../../stores/siDraftStore';

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

  const form    = useSiDraftStore(s => s.form);
  const setForm = useSiDraftStore(s => s.setForm);

  const styles = makeStyles(sp, typo);

  function fillFromSaved(party: typeof SAVED_PARTIES[0]) {
    setForm({ notifyName: party.name, notifyPhone: party.phone, notifyEmail: party.email });
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <ScreenHeader
        title={form.ref ?? 'New shipping instruction'}
        subtitle="Notify party"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={5} />

      <KeyboardAwareScrollView
        bottomOffset={24}
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
          value={form.notifyName}
          onChangeText={t => setForm({ notifyName: t })}
        />
        <AppInput
          label="Phone"
          placeholder="Notify party phone"
          keyboardType="phone-pad"
          value={form.notifyPhone}
          onChangeText={t => setForm({ notifyPhone: t })}
        />
        <AppInput
          label="Email"
          placeholder="Notify party email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.notifyEmail}
          onChangeText={t => setForm({ notifyEmail: t })}
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
      </KeyboardAwareScrollView>

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
