import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { CompanyDetailsProps }     from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { Avatar }                  from '../../components/Avatar';
import { DetailGroup }             from '../../components/DetailGroup';
import { Icon }                    from '../../components/Icon';

// ─── EditButton ───────────────────────────────────────────────────────────────

function EditButton() {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  return (
    <TouchableOpacity style={[editStyles.btn, { gap: sp.xxs }]} hitSlop={8} activeOpacity={0.7}>
      <Icon name="pencil-outline" size={14} color={colors.text.link} />
      <Text style={[editStyles.text, { color: colors.text.link, fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.semiBold }]}>
        Edit
      </Text>
    </TouchableOpacity>
  );
}

const editStyles = StyleSheet.create({
  btn:  { flexDirection: 'row', alignItems: 'center' },
  text: {},
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CompanyDetailsScreen({ navigation }: Readonly<CompanyDetailsProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <ScreenHeader
        title="Company details"
        titleAlign="left"
        onBack={() => navigation.goBack()}
        rightElement={<EditButton />}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + sp.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={styles.identity}>
          <Avatar initials="AE" size={64} />
          <Text style={[styles.name, { color: colors.text.primary }]}>Acme Exports Inc.</Text>
          <View style={[styles.verified, { backgroundColor: `${colors.success.main}26` }]}>
            <Icon name="check-decagram" size={14} color={colors.success.main} />
            <Text style={[styles.verifiedText, { color: colors.success.main }]}>Verified exporter</Text>
          </View>
        </View>

        <DetailGroup
          heading="BUSINESS"
          rows={[
            { label: 'Legal name',    value: 'Acme Exports Inc.' },
            { label: 'Trading name',  value: 'Acme Exports' },
            { label: 'Incorporation', value: 'Ontario, Canada' },
            { label: 'Industry',      value: 'Used vehicle export' },
          ]}
        />

        <DetailGroup
          heading="REGISTERED ADDRESS"
          rows={[
            { label: 'Street',        value: '123 Export Lane' },
            { label: 'City / Province', value: 'Toronto, ON' },
            { label: 'Postal code',   value: 'M5V 2T6' },
            { label: 'Country',       value: 'Canada' },
          ]}
        />

        <DetailGroup
          heading="PRIMARY CONTACT"
          rows={[
            { label: 'Name',  value: 'James O.' },
            { label: 'Role',  value: 'Operations' },
            { label: 'Email', value: 'ops@acmeexports.com' },
            { label: 'Phone', value: '+1-416-555-0100' },
          ]}
        />
      </ScrollView>
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
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.lg },

    identity:  { alignItems: 'center', marginBottom: sp.lg },
    name:      { fontSize: typo.fontSize.xxl, fontWeight: typo.fontWeight.bold, marginTop: sp.sm, marginBottom: sp.xs },
    verified: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               sp.xxs,
      paddingHorizontal: sp.sm,
      paddingVertical:   sp.xxs,
      borderRadius:      typo.borderRadius.full,
    },
    verifiedText: { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold },
  });
}
