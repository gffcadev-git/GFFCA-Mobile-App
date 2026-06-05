import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { NewShippingStep4Props }      from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }               from '../../components/ScreenHeader';
import { AppButton }                  from '../../components/AppButton';
import { StepProgress }               from '../../components/StepProgress';
import { SaveDraftButton }            from '../../components/SaveDraftButton';
import { SelectableCard }             from '../../components/SelectableCard';
import { WizardFooter }               from '../../components/WizardFooter';
import { IconName }                   from '../../components/Icon';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

type CargoType = {
  id:        string;
  icon:      IconName;
  title:     string;
  subtitle:  string;
  /** Whether picking this type routes through the per-vehicle VIN flow */
  needsVin:  boolean;
};

const CARGO_TYPES: CargoType[] = [
  { id: 'auto',          icon: 'car',           title: 'Used auto',                 subtitle: 'Vehicles — requires VIN verification',       needsVin: true  },
  { id: 'auto-effects',  icon: 'car-multiple',  title: 'Used auto + personal effects', subtitle: 'Vehicles plus household / personal goods', needsVin: true  },
  { id: 'clothing',      icon: 'tshirt-crew',   title: 'Used clothing',             subtitle: 'Textiles and apparel',                       needsVin: false },
  { id: 'metal',         icon: 'factory',       title: 'Metal scrap',               subtitle: 'Ferrous and non-ferrous scrap',              needsVin: false },
  { id: 'machinery',     icon: 'wrench-outline', title: 'Used machinery',           subtitle: 'Industrial and commercial equipment',        needsVin: false },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingStep4Screen({ navigation }: Readonly<NewShippingStep4Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const [selectedId, setSelectedId] = useState<string>('auto');

  const styles    = makeStyles(sp, typo);
  const selected  = CARGO_TYPES.find(c => c.id === selectedId);

  function handleNext() {
    if (selected?.needsVin) {
      navigation.navigate('NewShippingCargoVehicles');
    } else {
      navigation.navigate('NewShippingStep5');
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <ScreenHeader
        title="New shipping instruction"
        subtitle="Cargo"
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
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text.primary }]}>
          What are you shipping?
        </Text>

        {CARGO_TYPES.map(cargo => (
          <SelectableCard
            key={cargo.id}
            icon={cargo.icon}
            title={cargo.title}
            subtitle={cargo.subtitle}
            selected={cargo.id === selectedId}
            onPress={() => setSelectedId(cargo.id)}
          />
        ))}
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
          onPress={handleNext}
          disabled={!selected}
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

    heading: {
      fontSize:     typo.fontSize.xxl,
      fontWeight:   typo.fontWeight.bold,
      marginBottom: sp.lg,
    },

    backBtn: { flex: 1 },
    nextBtn: { flex: 2 },
  });
}
