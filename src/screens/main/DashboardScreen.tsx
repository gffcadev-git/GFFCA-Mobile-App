import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets }        from 'react-native-safe-area-context';
import { useColors, useSpacing, useTypography } from '../../theme';
import { Icon }                     from '../../components/Icon';
import { BottomNavBar, BOTTOM_NAV_HEIGHT } from '../../components/BottomNavBar';

// ─── Mock data ────────────────────────────────────────────────────────────────

const PROJECTS = [
  { id: '#GFF-001', name: 'Project Alpha', status: 'Active'   as StatusVariant, lastUpdate: '2 hours ago' },
  { id: '#GFF-002', name: 'Project Beta',  status: 'Active'   as StatusVariant, lastUpdate: '5 hours ago' },
  { id: '#GFF-003', name: 'Project Gamma', status: 'Pending'  as StatusVariant, lastUpdate: 'Yesterday' },
  { id: '#GFF-004', name: 'Project Delta', status: 'Inactive' as StatusVariant, lastUpdate: '3 days ago' },
];

type StatusVariant = 'Active' | 'Pending' | 'Inactive';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, tint }: Readonly<{ value: number; label: string; tint: string }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStatCardStyles(sp, typo);
  return (
    <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
      <Text style={[styles.value, { color: colors.text.primary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>
      <View style={[styles.accent, { backgroundColor: tint }]} />
    </View>
  );
}

function StatusBadge({ status }: Readonly<{ status: StatusVariant }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const map: Record<StatusVariant, { bg: string; text: string }> = {
    Active:   { bg: colors.success.dark,        text: colors.success.contrastText },
    Pending:  { bg: colors.warning.dark,        text: colors.warning.contrastText },
    Inactive: { bg: colors.background.elevated, text: colors.text.secondary },
  };
  const c = map[status];
  const styles = makeStatusBadgeStyles(sp, typo);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{status}</Text>
    </View>
  );
}

function ProjectRow({ id, name, status, lastUpdate }: Readonly<{
  id: string;
  name: string;
  status: StatusVariant;
  lastUpdate: string;
}>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeProjectRowStyles(sp, typo);
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.background.paper, borderColor: colors.border }]}
      activeOpacity={0.75}
    >
      <View style={styles.left}>
        <Text style={[styles.projectId,     { color: colors.text.link }]}>{id}</Text>
        <Text style={[styles.projectName,   { color: colors.text.primary }]}>{name}</Text>
        <Text style={[styles.projectUpdate, { color: colors.text.secondary }]}>{lastUpdate}</Text>
      </View>
      <StatusBadge status={status} />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function DashboardScreen() {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeDashboardStyles(sp, typo);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + sp.xs }]}>
        <Text style={[styles.headerAppName, { color: colors.text.primary }]}>GFF Portal</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellBtn}>
            <Icon name="bell-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: colors.primary.main }]}>
            <Text style={[styles.avatarText, { color: colors.primary.contrastText }]}>J</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + sp.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome banner */}
        <View style={[styles.welcomeCard, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <Text style={[styles.welcomeText, { color: colors.text.primary }]}>
            Welcome back, James
          </Text>
          <Text style={[styles.welcomeSub, { color: colors.text.secondary }]}>
            You have{' '}
            <Text style={{ color: colors.primary.light, fontWeight: typo.fontWeight.semiBold }}>
              3 items
            </Text>{' '}
            requiring your response →
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={2} label="Pending Invoices"    tint={colors.badge.green} />
          <View style={{ width: sp.sm }} />
          <StatCard value={7} label="Comments / Updates"  tint={colors.badge.blue} />
        </View>

        {/* Projects header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Projects</Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: colors.text.link }]}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Project list */}
        {PROJECTS.map(p => (
          <ProjectRow key={p.id} {...p} />
        ))}
      </ScrollView>

      <BottomNavBar activeTab="Home" messageBadge={2} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStatCardStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    card:   { flex: 1, borderRadius: typo.borderRadius.lg, borderWidth: 1, padding: sp.md, overflow: 'hidden' },
    value:  { fontSize: 36, fontWeight: '800', marginBottom: sp.xxs },
    label:  { fontSize: typo.fontSize.xs, lineHeight: typo.lineHeight.tight },
    accent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 2 },
  });
}

function makeStatusBadgeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    badge:     { paddingHorizontal: sp.xs, paddingVertical: sp.xxs, borderRadius: typo.borderRadius.full },
    badgeText: { fontSize: typo.fontSize.xs, fontWeight: typo.fontWeight.semiBold },
  });
}

function makeProjectRowStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    row:           {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      borderRadius:      typo.borderRadius.lg,
      borderWidth:       1,
      padding:           sp.sm,
      marginBottom:      sp.xs,
    },
    left:          { flex: 1, marginRight: sp.sm },
    projectId:     { fontSize: typo.fontSize.xs,   fontWeight: typo.fontWeight.semiBold, marginBottom: sp.xxs },
    projectName:   { fontSize: typo.fontSize.base,  fontWeight: typo.fontWeight.semiBold, marginBottom: sp.xxs },
    projectUpdate: { fontSize: typo.fontSize.xs },
  });
}

function makeDashboardStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:          { flex: 1 },
    header:        {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      paddingHorizontal: sp.screenHorizontal,
      paddingBottom:     sp.sm,
    },
    headerAppName: { fontSize: typo.fontSize.xl, fontWeight: typo.fontWeight.bold },
    headerRight:   { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
    bellBtn:       { padding: sp.xxs },
    avatar:        {
      width:          36,
      height:         36,
      borderRadius:   18,
      alignItems:     'center',
      justifyContent: 'center',
    },
    avatarText:    { fontSize: typo.fontSize.lg, fontWeight: typo.fontWeight.bold },

    scroll:        { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.xxs },

    welcomeCard:   { borderRadius: typo.borderRadius.lg, borderWidth: 1, padding: sp.md, marginBottom: sp.md },
    welcomeText:   { fontSize: typo.fontSize.xxl, fontWeight: typo.fontWeight.bold, marginBottom: sp.xxs },
    welcomeSub:    { fontSize: typo.fontSize.md, lineHeight: typo.lineHeight.tight },

    statsRow:      { flexDirection: 'row', marginBottom: sp.xl },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sp.sm },
    sectionTitle:  { fontSize: typo.fontSize.xl, fontWeight: typo.fontWeight.semiBold },
    viewAll:       { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.medium },
  });
}
