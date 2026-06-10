import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { NotificationsProps }      from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { Icon, IconName }          from '../../components/Icon';

// ─── Mock data ────────────────────────────────────────────────────────────────

type Notification = {
  id:     string;
  icon:   IconName;
  /** Base colour for the tinted icon tile + glyph */
  tone:   'error' | 'info' | 'success' | 'warning' | 'primary';
  title:  string;
  time:   string;
  body:   string;
  unread: boolean;
};

const TODAY: Notification[] = [
  { id: '1', icon: 'alert-outline',        tone: 'error',   title: 'Action needed · #GFF-2047', time: '9:38 AM', body: 'The docs team needs the missing consignee phone number to continue.', unread: true },
  { id: '2', icon: 'chat-outline',         tone: 'info',    title: 'New message · Sarah K.',     time: '9:12 AM', body: '"Thanks James — processing your shipment now."',                       unread: true },
  { id: '3', icon: 'shield-check-outline', tone: 'success', title: 'VIN verified',               time: '8:05 AM', body: '1HGCM82633A004352 cleared RCMP & Carfax checks.',                       unread: true },
];

const EARLIER: Notification[] = [
  { id: '4', icon: 'refresh',               tone: 'warning', title: '#GFF-2043 moved to Under review', time: 'Jun 1',  body: 'Metal scrap to Lagos, Nigeria is now with the docs team.',          unread: false },
  { id: '5', icon: 'check-circle-outline',  tone: 'success', title: '#GFF-2039 submitted',             time: 'May 31', body: 'Used clothing to Accra, Ghana submitted successfully.',              unread: false },
  { id: '6', icon: 'file-document-outline', tone: 'primary', title: 'Booking linked · #GFF-2043',      time: 'May 30', body: 'Carrier MSC Mediterranean linked from booking MSC1234567.',          unread: false },
];

// ─── MarkAllReadButton ────────────────────────────────────────────────────────

function MarkAllReadButton() {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const markStyles = makeMarkStyles(sp, typo);
  return (
    <TouchableOpacity
      style={[markStyles.pill, { borderColor: colors.primary.main }]}
      activeOpacity={0.7}
    >
      <Text style={[markStyles.text, { color: colors.primary.light, fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold }]}>
        Mark all read
      </Text>
    </TouchableOpacity>
  );
}

function makeMarkStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    pill: {
      borderWidth:       1,
      borderRadius:      typo.borderRadius.full,
      paddingHorizontal: sp.sm,
      paddingVertical:   sp.xs,
    },
    text: {},
  });
}

// ─── NotificationRow ──────────────────────────────────────────────────────────

function NotificationRow({ data }: Readonly<{ data: Notification }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeRowStyles(sp, typo);

  const toneColor: Record<Notification['tone'], string> = {
    error:   colors.error.main,
    info:    colors.info.main,
    success: colors.success.main,
    warning: colors.warning.main,
    primary: colors.primary.light,
  };
  const tint = toneColor[data.tone];

  return (
    <TouchableOpacity
      style={[
        styles.row,
        data.unread
          ? { backgroundColor: colors.background.paper, borderColor: colors.border }
          : styles.rowRead,
      ]}
      activeOpacity={0.75}
    >
      {/* Tinted icon tile */}
      <View style={[styles.tile, { backgroundColor: `${tint}26` }]}>
        <Icon name={data.icon} size={20} color={tint} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
            {data.title}
          </Text>
          <Text style={[styles.time, { color: colors.text.secondary }]}>{data.time}</Text>
          {data.unread && <View style={[styles.dot, { backgroundColor: colors.primary.main }]} />}
        </View>
        <Text style={[styles.bodyText, { color: colors.text.secondary }]} numberOfLines={2}>
          {data.body}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NotificationsScreen({ navigation }: Readonly<NotificationsProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <ScreenHeader
        title="Notifications"
        titleAlign="left"
        onBack={() => navigation.goBack()}
        rightElement={<MarkAllReadButton />}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + sp.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* TODAY */}
        <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>TODAY</Text>
        {TODAY.map(n => (
          <NotificationRow key={n.id} data={n} />
        ))}

        {/* EARLIER */}
        <Text style={[styles.sectionHeading, { color: colors.text.secondary, marginTop: sp.lg }]}>EARLIER</Text>
        {EARLIER.map(n => (
          <NotificationRow key={n.id} data={n} />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeRowStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap:           sp.sm,
      borderWidth:   1,
      borderColor:   'transparent',
      borderRadius:  typo.borderRadius.lg,
      padding:       sp.sm,
      marginBottom:  sp.xs,
    },
    rowRead: { backgroundColor: 'transparent' },

    tile: {
      width:          40,
      height:         40,
      borderRadius:   typo.borderRadius.md,
      alignItems:     'center',
      justifyContent: 'center',
    },

    body:    { flex: 1 },
    topLine: { flexDirection: 'row', alignItems: 'center', gap: sp.xs, marginBottom: sp.xxxs },
    title:   { flex: 1, fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.bold },
    time:    { fontSize: typo.fontSize.xs },
    dot:     { width: 8, height: 8, borderRadius: 4 },
    bodyText: { fontSize: typo.fontSize.sm, lineHeight: typo.lineHeight.tight },
  });
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },

    sectionHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.sm,
    },
  });
}
