import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { CompanyDetailsProps }     from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { Avatar }                  from '../../components/Avatar';
import { AppButton }               from '../../components/AppButton';
import { DetailGroup }             from '../../components/DetailGroup';
import { Icon }                    from '../../components/Icon';
import { useAuthStore }            from '../../stores/authStore';
import { useCompany }              from '../../hooks/useCompany';

/** "Global Shipping Corp" → "GS" for the avatar. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '—';
}

/** "parent" → "Parent". */
function titleCase(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

const DASH = '—';

// ─── EditButton ───────────────────────────────────────────────────────────────

// function EditButton() {
//   const colors = useColors();
//   const sp     = useSpacing();
//   const typo   = useTypography();
//   return (
//     <TouchableOpacity style={[editStyles.btn, { gap: sp.xxs }]} hitSlop={8} activeOpacity={0.7}>
//       <Icon name="pencil-outline" size={14} color={colors.text.link} />
//       <Text style={[editStyles.text, { color: colors.text.link, fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.semiBold }]}>
//         Edit
//       </Text>
//     </TouchableOpacity>
//   );
// }

// const editStyles = StyleSheet.create({
//   btn:  { flexDirection: 'row', alignItems: 'center' },
//   text: {},
// });

// ─── Screen ───────────────────────────────────────────────────────────────────

export function CompanyDetailsScreen({ navigation }: Readonly<CompanyDetailsProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  // companyId comes from the signed-in user, persisted to MMKV by the auth store.
  const companyId = useAuthStore(s => s.user?.companyId);
  const { data: company, isLoading, isError, refetch } = useCompany(companyId);

  console.log('Company details:', { company, isLoading, isError, companyId });

  // Loading / error / no-id states.
  if (!company) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.default }]}>
        <ScreenHeader title="Company details" titleAlign="left" onBack={() => navigation.goBack()} />
        <View style={styles.state}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary.main} />
          ) : (
            <>
              <Text style={[styles.stateText, { color: colors.text.secondary }]}>
                {companyId
                  ? "Couldn't load company details."
                  : 'No company is linked to your account.'}
              </Text>
              {isError && companyId && (
                <AppButton title="Retry" variant="outline" onPress={() => refetch()} style={styles.retryBtn} />
              )}
            </>
          )}
        </View>
      </View>
    );
  }

  const contact = company.contacts?.[0];

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <ScreenHeader
        title="Company details"
        titleAlign="left"
        onBack={() => navigation.goBack()}
        // rightElement={<EditButton />}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + sp.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={styles.identity}>
          <Avatar initials={initialsOf(company.name)} size={64} />
          <Text style={[styles.name, { color: colors.text.primary }]}>{company.name}</Text>
          {company.isActive && (
            <View style={[styles.verified, { backgroundColor: `${colors.success.main}26` }]}>
              <Icon name="check-decagram" size={14} color={colors.success.main} />
              <Text style={[styles.verifiedText, { color: colors.success.main }]}>Active</Text>
            </View>
          )}
        </View>

        <DetailGroup
          heading="BUSINESS"
          rows={[
            { label: 'Legal name',   value: company.name },
            { label: 'Company type', value: titleCase(company.type) || DASH },
            { label: 'Tax ID',       value: company.taxId ?? DASH },
            { label: 'Status',       value: company.isActive ? 'Active' : 'Inactive' },
          ]}
        />

        <DetailGroup
          heading="REGISTERED ADDRESS"
          rows={[
            { label: 'Address', value: company.address ?? DASH },
            { label: 'City',    value: company.city    ?? DASH },
            { label: 'Country', value: company.country ?? DASH },
          ]}
        />

        <DetailGroup
          heading="CONTACT"
          rows={[
            { label: 'Name',  value: contact?.name ?? DASH },
            { label: 'Role',  value: contact?.role ?? DASH },
            { label: 'Email', value: company.email ?? contact?.email ?? DASH },
            { label: 'Phone', value: company.phone ?? contact?.phone ?? DASH },
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

    state:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp.xl, gap: sp.md },
    stateText: { fontSize: typo.fontSize.md, textAlign: 'center' },
    retryBtn:  { minWidth: 140 },

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
