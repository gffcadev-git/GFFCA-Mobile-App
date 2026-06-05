import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';

export type DetailRow = { label: string; value: string };

type Props = Readonly<{
  heading: string;
  rows: DetailRow[];
  /** Show hairline dividers between rows (default true) */
  dividers?: boolean;
}>;

/**
 * A titled card listing label/value rows, optionally separated by hairline
 * dividers. Used for read-only detail sections (company details, summaries, …).
 */
export function DetailGroup({ heading, rows, dividers = true }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  return (
    <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
      <Text style={[styles.heading, { color: colors.text.secondary }]}>{heading}</Text>
      {rows.map((r, i) => (
        <View
          key={r.label}
          style={[
            styles.row,
            dividers && i < rows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
          ]}
        >
          <Text style={[styles.label, { color: colors.text.secondary }]}>{r.label}</Text>
          <Text style={[styles.value, { color: colors.text.primary }]}>{r.value}</Text>
        </View>
      ))}
    </View>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    card: {
      borderWidth:       1,
      borderRadius:      typo.borderRadius.lg,
      paddingHorizontal: sp.md,
      paddingTop:        sp.md,
      marginBottom:      sp.md,
    },
    heading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.xs,
    },
    row: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      paddingVertical: sp.sm,
      gap:            sp.md,
    },
    label: { fontSize: typo.fontSize.sm },
    value: { flex: 1, textAlign: 'right', fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.bold },
  });
}
