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

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingStep1Screen({ navigation, route }: Readonly<NewShippingStep1Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const [bookingNumber, setBookingNumber] = useState('');
  const [destination,   setDestination]   = useState('');

  // Mock: carrier is "linked" once a booking number is entered
  const carrierLinked = bookingNumber.trim().length > 0;

  const styles = makeStyles(sp, typo);

  function handleNext() {
    navigation.navigate('NewShippingStep2');
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header — show the SI id when resuming a draft, else the create title. */}
      <ScreenHeader
        title={route.params?.ref ?? 'New shipping instruction'}
        subtitle="Destination & booking"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={1} />

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
          Enter your booking number — we'll auto-fill the carrier from it. No booking yet? Leave it blank and the docs team can link one for you.
        </InfoBanner>

        {/* Booking number */}
        <AppInput
          label="Booking number"
          placeholder="MSC1234567"
          autoCapitalize="characters"
          value={bookingNumber}
          onChangeText={setBookingNumber}
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
          value={destination}
          onChangeText={setDestination}
          helperText="City and country of final delivery."
        />
      </ScrollView>

      {/* Fixed bottom — Next button */}
      <WizardFooter>
        <AppButton
          title="Next →"
          onPress={handleNext}
          disabled={!destination.trim()}
          style={styles.fullBtn}
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
