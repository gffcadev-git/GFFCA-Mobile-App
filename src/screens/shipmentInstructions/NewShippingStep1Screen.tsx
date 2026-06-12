import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { NewShippingStep1Props }      from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }               from '../../components/ScreenHeader';
import { AppInput }                   from '../../components/AppInput';
import { AppButton }                  from '../../components/AppButton';
import { StepProgress }               from '../../components/StepProgress';
import { SaveDraftButton }            from '../../components/SaveDraftButton';
import { InfoBanner }                 from '../../components/InfoBanner';
import { WizardFooter }               from '../../components/WizardFooter';
import { Icon }                       from '../../components/Icon';
import { useShipmentDetail }          from '../../hooks/useShipments';
import { useSiDraftStore }            from '../../stores/siDraftStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingStep1Screen({ navigation, route }: Readonly<NewShippingStep1Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  // Resuming a draft → fetch the saved SI; the form lives in the shared store.
  const { data: draft } = useShipmentDetail(route.params?.id);
  const form    = useSiDraftStore(s => s.form);
  const setForm = useSiDraftStore(s => s.setForm);
  const hydrate = useSiDraftStore(s => s.hydrate);
  const reset   = useSiDraftStore(s => s.reset);

  // Start each flow from a clean form; resuming hydrates once the SI loads.
  useEffect(() => { reset(); }, [reset]);
  useEffect(() => { if (draft) hydrate(draft); }, [draft, hydrate]);

  // Mock: carrier is "linked" once a booking number is entered
  const carrierLinked = form.bookingNumber.trim().length > 0;

  const styles = makeStyles(sp, typo);

  function handleNext() {
    navigation.navigate('NewShippingStep2');
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header — show the SI id when resuming a draft, else the create title. */}
      <ScreenHeader
        title={route.params?.ref ?? 'New shipping instruction'}
        subtitle="Destination & booking"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={1} />

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
          Enter your booking number — we'll auto-fill the carrier from it. No booking yet? Leave it blank and the docs team can link one for you.
        </InfoBanner>

        {/* Booking number */}
        <AppInput
          label="Booking number"
          placeholder="MSC1234567"
          autoCapitalize="characters"
          value={form.bookingNumber}
          onChangeText={t => setForm({ bookingNumber: t })}
          helperText="The carrier / line is filled in automatically once a valid booking is entered."
        />

        {/* Carrier auto-fill card — visible once booking is entered */}
        {carrierLinked && (
          <View style={[styles.carrierCard, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
            <View style={styles.carrierLeft}>
              <Text style={[styles.carrierMeta, { color: colors.text.secondary }]}>
                CARRIER · AUTO-FILLED
              </Text>
              <View style={styles.carrierNameRow}>
                <Icon name="ferry" size={16} color={colors.text.secondary} />
                <Text style={[styles.carrierName, { color: colors.text.primary }]}>
                  MSC Mediterranean
                </Text>
              </View>
            </View>
            <View style={[styles.linkedBadge, { backgroundColor: colors.success.dark }]}>
              <Icon name="check" size={12} color={colors.success.contrastText} />
              <Text style={[styles.linkedText, { color: colors.success.contrastText }]}>
                Linked
              </Text>
            </View>
          </View>
        )}

        {/* Destination */}
        <AppInput
          label="Destination"
          required
          placeholder="Kingston, Jamaica"
          value={form.destination}
          onChangeText={t => setForm({ destination: t })}
          helperText="City and country of final delivery."
        />
      </KeyboardAwareScrollView>

      {/* Fixed bottom — Next button */}
      <WizardFooter>
        <AppButton
          title="Next →"
          onPress={handleNext}
          disabled={!form.destination.trim()}
          style={styles.fullBtn}
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
    root:    { flex: 1 },
    scroll:  { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },
    fullBtn: { flex: 1 },

    carrierCard: {
      flexDirection:    'row',
      alignItems:       'center',
      justifyContent:   'space-between',
      borderWidth:      1,
      borderRadius:     typo.borderRadius.md,
      padding:          sp.sm,
      marginTop:        -sp.xs,
      marginBottom:     sp.md,
    },
    carrierLeft: { flex: 1 },
    carrierMeta: {
      fontSize:     typo.fontSize.xs,
      fontWeight:   typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom: sp.xxs,
    },
    carrierNameRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           sp.xs,
    },
    carrierName: {
      fontSize:   typo.fontSize.base,
      fontWeight: typo.fontWeight.semiBold,
    },
    linkedBadge: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               sp.xxs,
      paddingHorizontal: sp.xs,
      paddingVertical:   sp.xxs,
      borderRadius:      typo.borderRadius.full,
    },
    linkedText: {
      fontSize:   typo.fontSize.xs,
      fontWeight: typo.fontWeight.semiBold,
    },
  });
}
