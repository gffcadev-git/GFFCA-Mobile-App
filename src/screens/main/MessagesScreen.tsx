import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets }              from 'react-native-safe-area-context';
import { useNavigation }                  from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors, useSpacing, useTypography } from '../../theme';
import type { MainStackParamList }        from '../../navigation/types';
import { Avatar }                         from '../../components/Avatar';
import { TabHeader }                      from '../../components/TabHeader';
import { BottomNavBar, BOTTOM_NAV_HEIGHT } from '../../components/BottomNavBar';

// ─── Mock data ────────────────────────────────────────────────────────────────

type Conversation = {
  id:       string;
  initials: string;
  title:    string;
  ref:      string;
  preview:  string;
  time:     string;
  unread:   number;
};

const CONVERSATIONS: Conversation[] = [
  {
    id:       '1',
    initials: 'GF',
    title:    'Docs team · Sarah K.',
    ref:      '#GFF-2047',
    preview:  'We need the consignee phone number before we can process…',
    time:     'Jun 1',
    unread:   1,
  },
];

type Nav = NativeStackNavigationProp<MainStackParamList>;

// ─── ConversationRow ──────────────────────────────────────────────────────────

function ConversationRow({ data, onPress }: Readonly<{ data: Conversation; onPress: () => void }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeRowStyles(sp, typo);

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.background.paper, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Avatar initials={data.initials} size={44} />

      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
            {data.title}
          </Text>
          <Text style={[styles.time, { color: colors.text.secondary }]}>{data.time}</Text>
        </View>

        <Text style={[styles.ref, { color: colors.text.link }]}>{data.ref}</Text>

        <View style={styles.bottomLine}>
          <Text style={[styles.preview, { color: colors.text.secondary }]} numberOfLines={2}>
            {data.preview}
          </Text>
          {data.unread > 0 && (
            <View style={[styles.unread, { backgroundColor: colors.error.main }]}>
              <Text style={[styles.unreadText, { color: colors.primary.contrastText }]}>{data.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MessagesScreen() {
  const colors     = useColors();
  const sp         = useSpacing();
  const typo       = useTypography();
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const styles     = makeStyles(sp, typo);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <TabHeader
        title="Messages"
        avatarInitials="AE"
        onBellPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + sp.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionHeading, { color: colors.text.secondary }]}>CONVERSATIONS</Text>

        {CONVERSATIONS.map(c => (
          <ConversationRow
            key={c.id}
            data={c}
            onPress={() => navigation.navigate('MessageThread', { ref: c.ref, subtitle: c.title })}
          />
        ))}
      </ScrollView>

      <BottomNavBar activeTab="Messages" messageBadge={2} />
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
      borderRadius:  typo.borderRadius.lg,
      padding:       sp.sm,
    },
    body:    { flex: 1 },
    topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title:   { flex: 1, fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.bold, marginRight: sp.xs },
    time:    { fontSize: typo.fontSize.xs },
    ref:     { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold, marginTop: sp.xxxs, marginBottom: sp.xxs },
    bottomLine: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.xs },
    preview: { flex: 1, fontSize: typo.fontSize.sm, lineHeight: typo.lineHeight.tight },
    unread: {
      minWidth:          18,
      height:            18,
      borderRadius:      9,
      alignItems:        'center',
      justifyContent:    'center',
      paddingHorizontal: sp.xxs,
      marginTop:         sp.xxxs,
    },
    unreadText: { fontSize: typo.fontSize.xxs, fontWeight: typo.fontWeight.bold },
  });
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root: { flex: 1 },

    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.xs },

    sectionHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.sm,
    },
  });
}
