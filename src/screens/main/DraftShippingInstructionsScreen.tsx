import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets }              from 'react-native-safe-area-context';
import { DraftShippingInstructionsProps } from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { AppButton }               from '../../components/AppButton';
import { InfoBanner }              from '../../components/InfoBanner';
import { Badge }                   from '../../components/Badge';
import { Icon }                    from '../../components/Icon';

// ─── Mock data ────────────────────────────────────────────────────────────────

type Draft = {
  id:       string;
  ref:      string;
  edited:   string;
  route:    string;
  item:     string;
  stepNo:   number;
  stepName: string;
  percent:  number;
};

const DRAFTS: Draft[] = [
  { id: '1', ref: '#GFF-2031', edited: 'Edited 2 days ago', route: 'Banjul, Gambia · Used auto',     item: '2008 Toyota Corolla',     stepNo: 4, stepName: 'Cargo',     percent: 67 },
  { id: '2', ref: '#GFF-2029', edited: 'Edited 5 days ago', route: 'Tema, Ghana · Used clothing',     item: 'Mixed apparel — 40 bales', stepNo: 2, stepName: 'Container', percent: 33 },
  { id: '3', ref: '#GFF-2026', edited: 'Edited Jun 1',      route: 'Dakar, Senegal · Used machinery', item: 'Generator set',            stepNo: 5, stepName: 'Notify',    percent: 83 },
];

// ─── DraftCard ────────────────────────────────────────────────────────────────

type DraftCardProps = {
  data:      Draft;
  onResume:  () => void;
  onDiscard: () => void;
};

function DraftCard({ data, onResume, onDiscard }: Readonly<DraftCardProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeCardStyles(sp, typo);

  return (
    <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={[styles.ref, { color: colors.text.primary }]}>{data.ref}</Text>
        <Badge label="Draft" tone="neutral" />
        <View style={styles.spacer} />
        <Text style={[styles.edited, { color: colors.text.secondary }]}>{data.edited}</Text>
      </View>

      {/* Route */}
      <View style={styles.metaRow}>
        <Icon name="map-marker-outline" size={13} color={colors.text.secondary} />
        <Text style={[styles.route, { color: colors.text.secondary }]} numberOfLines={1}>{data.route}</Text>
      </View>

      {/* Item */}
      <Text style={[styles.item, { color: colors.text.primary }]}>{data.item}</Text>

      {/* Progress */}
      <View style={styles.progressLabelRow}>
        <Text style={[styles.stepText, { color: colors.text.secondary }]}>
          Step {data.stepNo} of 6 · {data.stepName}
        </Text>
        <Text style={[styles.percent, { color: colors.primary.light }]}>{data.percent}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.background.elevated }]}>
        <View style={[styles.fill, { backgroundColor: colors.primary.main, width: `${data.percent}%` }]} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <AppButton
          title="Discard"
          variant="outline"
          onPress={onDiscard}
          icon={<Icon name="close" size={16} color={colors.text.primary} />}
          style={styles.actionBtn}
        />
        <AppButton
          title="Resume"
          onPress={onResume}
          iconRight={<Icon name="arrow-right" size={16} color={colors.primary.contrastText} />}
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DraftShippingInstructionsScreen({ navigation }: Readonly<DraftShippingInstructionsProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp);

  const [drafts, setDrafts] = useState(DRAFTS);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <ScreenHeader
        title="Draft shipping instructions"
        subtitle={`${drafts.length} drafts`}
        titleAlign="left"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + sp.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <InfoBanner>
          Drafts are saved automatically. Resume any SI to pick up where you left off.
        </InfoBanner>

        {drafts.map(d => (
          <DraftCard
            key={d.id}
            data={d}
            onResume={() => navigation.navigate('NewShippingStep1')}
            onDiscard={() => setDrafts(ds => ds.filter(x => x.id !== d.id))}
          />
        ))}
      </ScrollView>
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
    topRow:  { flexDirection: 'row', alignItems: 'center', gap: sp.xs, marginBottom: sp.xs },
    ref:     { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.bold },
    spacer:  { flex: 1 },
    edited:  { fontSize: typo.fontSize.xs },

    metaRow: { flexDirection: 'row', alignItems: 'center', gap: sp.xxs, marginBottom: sp.xs },
    route:   { flex: 1, fontSize: typo.fontSize.sm },

    item:    { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.semiBold, marginBottom: sp.sm },

    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sp.xs },
    stepText: { fontSize: typo.fontSize.sm },
    percent:  { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.bold },
    track:    { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: sp.md },
    fill:     { height: 6, borderRadius: 3 },

    actions:   { flexDirection: 'row', gap: sp.sm },
    actionBtn: { flex: 1 },
  });
}

function makeStyles(sp: ReturnType<typeof useSpacing>) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },
  });
}
