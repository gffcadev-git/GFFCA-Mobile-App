import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { TaxComplianceProps }      from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { InfoBanner }              from '../../components/InfoBanner';
import { Badge }                   from '../../components/Badge';
import { Icon, IconName }          from '../../components/Icon';

// ─── Mock data ────────────────────────────────────────────────────────────────

type ComplianceId = {
  id:       string;
  icon:     IconName;
  label:    string;
  value:    string;
  verified: boolean;
};

const IDS: ComplianceId[] = [
  { id: '1', icon: 'office-building-outline', label: 'Business Number (CRA)', value: '87244 5109 RC0001', verified: true  },
  { id: '2', icon: 'file-document-outline',   label: 'GST / HST account',     value: '87244 5109 RT0001', verified: true  },
  { id: '3', icon: 'ferry',                   label: 'Import / Export (RM)',  value: '87244 5109 RM0001', verified: true  },
  { id: '4', icon: 'shield-check-outline',    label: 'Bonded carrier code',   value: 'BC-4471-ON',        verified: false },
  { id: '5', icon: 'file-document-outline',   label: 'D-U-N-S number',        value: '20-114-8827',       verified: true  },
];

// ─── EditButton ───────────────────────────────────────────────────────────────

function EditButton() {
  const colors = useColors();
  const typo   = useTypography();
  return (
    <TouchableOpacity style={editStyles.btn} hitSlop={8} activeOpacity={0.7}>
      <Icon name="pencil-outline" size={14} color={colors.text.link} />
      <Text style={[editStyles.text, { color: colors.text.link, fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.semiBold }]}>
        Edit
      </Text>
    </TouchableOpacity>
  );
}

const editStyles = StyleSheet.create({
  btn:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: {},
});

// ─── IdCard ───────────────────────────────────────────────────────────────────

function IdCard({ data }: Readonly<{ data: ComplianceId }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeCardStyles(sp, typo);

  return (
    <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
      <View style={[styles.tile, { backgroundColor: colors.background.elevated }]}>
        <Icon name={data.icon} size={20} color={colors.text.secondary} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>{data.label}</Text>
        <Text style={[styles.value, { color: colors.text.primary }]}>{data.value}</Text>
      </View>

      {data.verified ? (
        <Badge label="Verified" tone="success" icon="check" />
      ) : (
        <Badge label="Pending" tone="warning" icon="clock-outline" />
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function TaxComplianceScreen({ navigation }: Readonly<TaxComplianceProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <ScreenHeader
        title="Tax & compliance IDs"
        titleAlign="left"
        onBack={() => navigation.goBack()}
        rightElement={<EditButton />}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + sp.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <InfoBanner>
          These IDs are attached automatically to every shipping instruction you submit.
        </InfoBanner>

        {IDS.map(item => (
          <IdCard key={item.id} data={item} />
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
      flexDirection: 'row',
      alignItems:    'center',
      gap:           sp.sm,
      borderWidth:   1,
      borderRadius:  typo.borderRadius.lg,
      padding:       sp.md,
      marginBottom:  sp.sm,
    },
    tile: {
      width:          40,
      height:         40,
      borderRadius:   typo.borderRadius.md,
      alignItems:     'center',
      justifyContent: 'center',
    },
    body:  { flex: 1 },
    label: { fontSize: typo.fontSize.xs, marginBottom: 2 },
    value: { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.bold },
  });
}

function makeStyles(sp: ReturnType<typeof useSpacing>) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },
  });
}
