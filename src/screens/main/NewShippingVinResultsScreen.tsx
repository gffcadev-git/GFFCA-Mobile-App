import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets }            from 'react-native-safe-area-context';
import { NewShippingVinResultsProps }   from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }                 from '../../components/ScreenHeader';
import { AppInput }                     from '../../components/AppInput';
import { AppButton }                    from '../../components/AppButton';
import { StepProgress }                 from '../../components/StepProgress';
import { SaveDraftButton }              from '../../components/SaveDraftButton';
import { WizardFooter }                 from '../../components/WizardFooter';
import { Icon }                         from '../../components/Icon';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

const CHECKS = ['VIN format valid', 'RCMP: not stolen', 'Carfax: clean title', 'Decoder: matched'];

type VehicleResult = {
  id:       string;
  vin:      string;
  make:     string;
  model:    string;
  year:     string;
  bodyType: string;
  engine:   string;
  hybrid:   string;
  weight:   string;
  value:    string;
};

const RESULTS: VehicleResult[] = [
  { id: '1', vin: '1HGCM82633A004352', make: 'Honda',  model: 'Accord',  year: '2003', bodyType: 'Sedan',     engine: '2.4L i4',  hybrid: 'No', weight: '1,580', value: '9,500' },
  { id: '2', vin: '2T1BURHE0JC014582', make: 'Toyota', model: 'Corolla', year: '2018', bodyType: 'Hatchback', engine: '1.8L i4',  hybrid: 'No', weight: '1,315', value: '14,200' },
];

// ─── VehicleResultCard ────────────────────────────────────────────────────────

function VehicleResultCard({ index, data }: Readonly<{ index: number; data: VehicleResult }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeCardStyles(sp, typo);

  // Local editable copy of the auto-pulled fields
  const [fields, setFields] = useState(data);
  const set = (key: keyof VehicleResult) => (v: string) => setFields(f => ({ ...f, [key]: v }));

  return (
    <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
      {/* Title */}
      <Text style={[styles.title, { color: colors.text.primary }]}>
        Vehicle {index + 1} — VIN{' '}
        <Text style={{ color: colors.text.secondary }}>{data.vin}</Text>
      </Text>

      {/* Check badges */}
      <View style={styles.badgeWrap}>
        {CHECKS.map(c => (
          <View key={c} style={[styles.badge, { borderColor: colors.success.dark, backgroundColor: colors.background.elevated }]}>
            <Icon name="check" size={12} color={colors.success.main} />
            <Text style={[styles.badgeText, { color: colors.success.main }]}>{c}</Text>
          </View>
        ))}
      </View>

      {/* Auto-pulled details */}
      <Text style={[styles.subHeading, { color: colors.text.secondary }]}>
        AUTO-PULLED DETAILS — CONFIRM OR CORRECT
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

  const styles = makeStyles(sp, typo);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <ScreenHeader
        title="New shipping instruction"
        subtitle="Cargo · VIN results"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={4} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: colors.text.secondary }]}>
          Checks completed for {RESULTS.length} vehicles. Review the results below — correct anything that looks wrong before continuing.
        </Text>

        {RESULTS.map((r, i) => (
          <VehicleResultCard key={r.id} index={i} data={r} />
        ))}
      </ScrollView>

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

    badgeWrap: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           sp.xs,
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
