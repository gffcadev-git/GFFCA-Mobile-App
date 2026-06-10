import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { MessageThreadProps }      from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { InfoBanner }              from '../../components/InfoBanner';
import { Icon }                    from '../../components/Icon';

// ─── Mock data ────────────────────────────────────────────────────────────────

type Side = 'in' | 'out';
type Message = { id: string; side: Side; date: string; text: string; author: string };

const MESSAGES: Message[] = [
  {
    id:     '1',
    side:   'in',
    date:   'May 29 · 10:14 AM',
    text:   'Hi James — we need the consignee phone number for #GFF-2047 before we can process this shipment. Can you please add it to the SI?',
    author: 'Sarah K. · Docs',
  },
  {
    id:     '2',
    side:   'out',
    date:   'Jun 1 · 9:38 AM',
    text:   "Hi Sarah, apologies for the delay. I'll update that now — it's +1-876-555-0312. Let me know if anything else is needed.",
    author: 'James O. · Acme',
  },
];

// ─── UrgentPill ───────────────────────────────────────────────────────────────

function UrgentPill() {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const pillStyles = makePillStyles(sp, typo);
  return (
    <View style={[pillStyles.pill, { borderColor: colors.error.main }]}>
      <Icon name="flag-variant" size={13} color={colors.error.main} />
      <Text style={[pillStyles.text, { color: colors.error.main, fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold }]}>
        Urgent
      </Text>
    </View>
  );
}

function makePillStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    pill: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               sp.xxs,
      borderWidth:       1,
      borderRadius:      typo.borderRadius.full,
      paddingHorizontal: sp.sm,
      paddingVertical:   sp.xxs,
    },
    text: {},
  });
}

// ─── ChatBubble ───────────────────────────────────────────────────────────────

function ChatBubble({ message }: Readonly<{ message: Message }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeBubbleStyles(sp, typo);

  const isOut = message.side === 'out';

  return (
    <View style={styles.group}>
      {/* Date separator */}
      <Text style={[styles.date, { color: colors.text.secondary }]}>{message.date}</Text>

      {/* Bubble */}
      <View style={[styles.bubbleRow, isOut ? styles.alignEnd : styles.alignStart]}>
        <View
          style={[
            styles.bubble,
            isOut ? styles.bubbleOutTail : styles.bubbleInTail,
            { backgroundColor: isOut ? colors.primary.main : colors.background.elevated },
          ]}
        >
          <Text style={[styles.text, { color: isOut ? colors.primary.contrastText : colors.text.primary }]}>
            {message.text}
          </Text>
        </View>
      </View>

      {/* Author */}
      <Text style={[styles.author, { color: colors.text.secondary }, isOut ? styles.textRight : styles.textLeft]}>
        {message.author}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function MessageThreadScreen({ navigation, route }: Readonly<MessageThreadProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  const { ref, subtitle } = route.params;
  const [reply, setReply] = useState('');

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <ScreenHeader
        title={ref}
        subtitle={subtitle}
        onBack={() => navigation.goBack()}
        rightElement={<UrgentPill />}
      />

      {/* Messages */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {MESSAGES.map(m => (
          <ChatBubble key={m.id} message={m} />
        ))}

        <InfoBanner>
          Your reply was delivered. The docs team will continue processing.
        </InfoBanner>
      </ScrollView>

      {/* Reply composer */}
      <View
        style={[
          styles.composer,
          { paddingBottom: insets.bottom + sp.sm, backgroundColor: colors.background.paper, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: colors.background.elevated, color: colors.text.primary }]}
          placeholder="Type a reply…"
          placeholderTextColor={colors.text.hint}
          value={reply}
          onChangeText={setReply}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: colors.primary.main },
            !reply.trim() && styles.sendDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!reply.trim()}
          onPress={() => setReply('')}
        >
          <Icon name="send" size={20} color={colors.primary.contrastText} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeBubbleStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    group: { marginBottom: sp.md },
    date: {
      textAlign:    'center',
      fontSize:     typo.fontSize.xs,
      marginBottom: sp.sm,
    },
    bubbleRow:  { flexDirection: 'row' },
    alignStart: { justifyContent: 'flex-start' },
    alignEnd:   { justifyContent: 'flex-end' },
    bubble: {
      maxWidth:     '82%',
      borderRadius: typo.borderRadius.lg,
      paddingHorizontal: sp.md,
      paddingVertical:   sp.sm,
    },
    bubbleOutTail: { borderBottomRightRadius: 4 },
    bubbleInTail:  { borderBottomLeftRadius: 4 },
    text: { fontSize: typo.fontSize.base, lineHeight: typo.lineHeight.normal },
    author: { fontSize: typo.fontSize.xs, marginTop: sp.xxs },
    textLeft:  { textAlign: 'left' },
    textRight: { textAlign: 'right' },
  });
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root: { flex: 1 },

    scroll: {
      paddingHorizontal: sp.screenHorizontal,
      paddingTop:        sp.md,
      paddingBottom:     sp.lg,
    },

    composer: {
      flexDirection:     'row',
      alignItems:        'flex-end',
      gap:               sp.sm,
      paddingHorizontal: sp.screenHorizontal,
      paddingTop:        sp.sm,
      borderTopWidth:    1,
    },
    input: {
      flex:              1,
      minHeight:         44,
      maxHeight:         120,
      borderRadius:      typo.borderRadius.lg,
      paddingHorizontal: sp.md,
      paddingVertical:   sp.sm,
      fontSize:          typo.fontSize.base,
    },
    sendBtn: {
      width:          44,
      height:         44,
      borderRadius:   typo.borderRadius.lg,
      alignItems:     'center',
      justifyContent: 'center',
    },
    sendDisabled: { opacity: 0.6 },
  });
}
