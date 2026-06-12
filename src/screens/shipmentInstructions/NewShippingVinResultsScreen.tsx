import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets }            from 'react-native-safe-area-context';
import { NewShippingVinResultsProps }   from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }                 from '../../components/ScreenHeader';
import { AppInput }                     from '../../components/AppInput';
import { AppButton }                    from '../../components/AppButton';
import { StepProgress }                 from '../../components/StepProgress';
import { SaveDraftButton }              from '../../components/SaveDraftButton';
import { WizardFooter }                 from '../../components/WizardFooter';
import { Icon, type IconName }          from '../../components/Icon';
import { useSiDraftStore }              from '../../stores/siDraftStore';
import { analyzeVin, type VinAnalysis } from '../../utils/vinAnalyzer';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

type BadgeState = 'valid' | 'warning' | 'invalid' | 'pending';
type Badge = { label: string; state: BadgeState };

/** Offline VIN-decode badges derived from the analysis (§2). */
function decodeBadges(a: VinAnalysis): Badge[] {
  const badges: Badge[] = [];

  badges.push(a.lengthOk
    ? { label: 'Length 17 ✓', state: 'valid' }
    : { label: `Length ${a.vin.length}/17`, state: 'invalid' });

  badges.push(a.invalidChars.length > 0
    ? { label: `Illegal char ${a.invalidChars.join(', ')}`, state: 'invalid' }
    : { label: 'Alphabet OK', state: 'valid' });

  if (a.checkDigitValid === true)        badges.push({ label: 'Checksum authentic', state: 'valid' });
  else if (a.checkDigitValid === false)  badges.push({ label: `Checksum: expected ${a.expectedCheckDigit}`, state: 'warning' });
  else                                   badges.push({ label: 'Checksum n/a', state: 'pending' });

  // External checks are not part of the offline spec — shown honestly as pending
  // until a theft (RCMP) / title (Carfax) integration is wired in.
  badges.push({ label: 'RCMP theft: pending', state: 'pending' });
  badges.push({ label: 'Carfax title: pending', state: 'pending' });

  return badges;
}

// ─── VehicleResultCard ────────────────────────────────────────────────────────

type Editable = { make: string; model: string; year: string; bodyType: string; engine: string; hybrid: string; weight: string; value: string };

const EMPTY_EDITABLE: Editable = { make: '', model: '', year: '', bodyType: '', engine: '', hybrid: '', weight: '', value: '' };

function VehicleResultCard({ index, vin }: Readonly<{ index: number; vin: string }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeCardStyles(sp, typo);

  const analysis = analyzeVin(vin);
  const badges   = decodeBadges(analysis);

  // Manual confirm/correct fields — left blank for the user to fill, since the
  // offline decoder yields only region/year/checksum (no make/model API).
  const [fields, setFields] = useState<Editable>(EMPTY_EDITABLE);
  const set = (key: keyof Editable) => (v: string) => setFields(f => ({ ...f, [key]: v }));

  const badgeStyleFor = (state: BadgeState): { border: string; fg: string; icon: IconName } => {
    switch (state) {
      case 'valid':   return { border: colors.success.dark, fg: colors.success.main, icon: 'check' };
      case 'warning': return { border: colors.warning.dark, fg: colors.warning.main, icon: 'alert-outline' };
      case 'invalid': return { border: colors.error.dark,   fg: colors.error.main,   icon: 'alert-circle-outline' };
      default:        return { border: colors.border,       fg: colors.text.secondary, icon: 'clock-outline' };
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
      {/* Title */}
      <Text style={[styles.title, { color: colors.text.primary }]}>
        Vehicle {index + 1} — VIN{' '}
        <Text style={{ color: colors.text.secondary }}>{analysis.vin || '—'}</Text>
      </Text>

      {/* Decoded summary (region + model year) */}
      <View style={styles.decodeRow}>
        <Text style={[styles.decodeLabel, { color: colors.text.secondary }]}>Region</Text>
        <Text style={[styles.decodeValue, { color: colors.text.primary }]}>{analysis.regionAndCountry}</Text>
      </View>
      <View style={styles.decodeRow}>
        <Text style={[styles.decodeLabel, { color: colors.text.secondary }]}>Model year</Text>
        <Text style={[styles.decodeValue, { color: colors.text.primary }]}>{analysis.modelYear}</Text>
      </View>

      {/* Check badges */}
      <View style={styles.badgeWrap}>
        {badges.map(b => {
          const bs = badgeStyleFor(b.state);
          return (
            <View key={b.label} style={[styles.badge, { borderColor: bs.border, backgroundColor: colors.background.elevated }]}>
              <Icon name={bs.icon} size={12} color={bs.fg} />
              <Text style={[styles.badgeText, { color: bs.fg }]}>{b.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Manual confirm/correct details */}
      <Text style={[styles.subHeading, { color: colors.text.secondary }]}>
        VEHICLE DETAILS — ENTER OR CONFIRM
      </Text>

      <View style={styles.fieldRow}>
        <View style={styles.fieldCol}><AppInput label="Make"  value={fields.make}  onChangeText={set('make')} /></View>
        <View style={styles.fieldCol}><AppInput label="Model" value={fields.model} onChangeText={set('model')} /></View>
      </View>
      <View style={styles.fieldRow}>
        <View style={styles.fieldCol}><AppInput label="Year"      value={fields.year}     onChangeText={set('year')} keyboardType="number-pad" /></View>
        <View style={styles.fieldCol}><AppInput label="Body type" value={fields.bodyType} onChangeText={set('bodyType')} /></View>
      </View>
      <View style={styles.fieldRow}>
        <View style={styles.fieldCol}><AppInput label="Engine"    value={fields.engine} onChangeText={set('engine')} /></View>
        <View style={styles.fieldCol}><AppInput label="Hybrid / EV" value={fields.hybrid} onChangeText={set('hybrid')} /></View>
      </View>
      <View style={styles.fieldRow}>
        <View style={styles.fieldCol}><AppInput label="Weight (kg)"  value={fields.weight} onChangeText={set('weight')} keyboardType="number-pad" /></View>
        <View style={styles.fieldCol}><AppInput label="Value (CAD)"  value={fields.value}  onChangeText={set('value')}  keyboardType="number-pad" /></View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingVinResultsScreen({ navigation }: Readonly<NewShippingVinResultsProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const siRef    = useSiDraftStore(s => s.form.ref);
  const vehicles = useSiDraftStore(s => s.form.vehicles);

  const styles = makeStyles(sp, typo);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <ScreenHeader
        title={siRef ?? 'New shipping instruction'}
        subtitle="Cargo · VIN results"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={4} />

      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: colors.text.secondary }]}>
          Decoded {vehicles.length} {vehicles.length === 1 ? 'VIN' : 'VINs'} offline — region, model year and check digit.
          Review the results below and fill in any details before continuing.
        </Text>

        {vehicles.map((v, i) => (
          <VehicleResultCard key={v.id} index={i} vin={v.vin} />
        ))}
      </KeyboardAwareScrollView>

      {/* Fixed bottom — Edit + Notify party */}
      <WizardFooter>
        <AppButton
          title="← Edit vehicles"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <AppButton
          title="Notify party →"
          onPress={() => navigation.navigate('NewShippingStep5')}
          style={styles.nextBtn}
        />
      </WizardFooter>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeCardStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    card: {
      borderWidth:  1,
      borderRadius: typo.borderRadius.lg,
      padding:      sp.md,
      marginBottom: sp.md,
    },
    title: {
      fontSize:     typo.fontSize.lg,
      fontWeight:   typo.fontWeight.semiBold,
      marginBottom: sp.sm,
    },

    decodeRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: sp.xxs },
    decodeLabel: { fontSize: typo.fontSize.sm },
    decodeValue: { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold, flexShrink: 1, textAlign: 'right' },

    badgeWrap: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           sp.xs,
      marginTop:     sp.sm,
      marginBottom:  sp.md,
    },
    badge: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               sp.xxs,
      borderWidth:       1,
      borderRadius:      typo.borderRadius.full,
      paddingHorizontal: sp.xs,
      paddingVertical:   sp.xxs,
    },
    badgeText: { fontSize: typo.fontSize.xs, fontWeight: typo.fontWeight.semiBold },

    subHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.sm,
    },

    fieldRow: { flexDirection: 'row', gap: sp.sm },
    fieldCol: { flex: 1 },
  });
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },

    intro: {
      fontSize:     typo.fontSize.md,
      lineHeight:   typo.lineHeight.normal,
      marginBottom: sp.md,
    },

    backBtn: { flex: 1 },
    nextBtn: { flex: 1 },
  });
}
