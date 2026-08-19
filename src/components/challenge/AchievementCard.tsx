import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface AchievementCardProps {
  title: string;
  amountLabel: string;
  streak: number;
  xp: number;
}

export function AchievementCard({ title, amountLabel, streak, xp }: AchievementCardProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${amountLabel} saved. ${streak} day streak. ${xp} XP.`}
      style={styles.card}>
      <View style={styles.stripe} accessibilityElementsHidden />
      <View style={styles.trophy} accessibilityElementsHidden>
        <Text style={styles.trophyGlyph}>🏆</Text>
      </View>
      <Text style={styles.kicker}>BLINKMONEY</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Challenge completed</Text>
      <Text style={styles.amount}>{amountLabel}</Text>
      <Text style={styles.saved}>SAVED</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>🔥 {streak} day streak</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta}>{xp} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 88,
    height: 88,
    backgroundColor: colors.primary,
    opacity: 0.16,
    borderBottomLeftRadius: 88,
  },
  trophy: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  trophyGlyph: {
    fontSize: 28,
  },
  kicker: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textPrimary,
    opacity: 0.72,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  amount: {
    ...typography.heroAmount,
    color: colors.primary,
    fontSize: 36,
    lineHeight: 42,
  },
  saved: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  meta: {
    ...typography.body,
    color: colors.textPrimary,
  },
  metaDot: {
    ...typography.body,
    color: colors.primary,
  },
});
