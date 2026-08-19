import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';

import { ChallengeEntryCard } from '@/components/challenge/ChallengeEntryCard';
import { useChallenge } from '@/features/challenge/ChallengeProvider';
import {
  calculateProgressRatio,
  formatRupees,
  getTodayDate,
  resolveChallengeStatus,
} from '@/features/challenge/utils';
import { colors, radius, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { challenge } = useChallenge();
  const today = getTodayDate();
  const status = challenge ? resolveChallengeStatus(challenge, today) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandMark} accessibilityElementsHidden />
          <Text style={styles.brand}>BlinkMoney</Text>
          <Text style={styles.tagline}>Save more. Every day.</Text>
        </View>

        <Text style={styles.greeting}>Good evening</Text>
        <Text style={styles.greetingSupport}>Start a savings challenge.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge</Text>
          {challenge && status === 'active' ? (
            <HomeChallengeCard
              eyebrow="YOUR CHALLENGE"
              title={`Save ${formatRupees(challenge.targetAmountPaise)}`}
              savedLabel={`${formatRupees(challenge.savedAmountPaise)} saved`}
              streakLabel={`🔥 ${challenge.currentStreak} day streak`}
              percent={Math.round(
                calculateProgressRatio(
                  challenge.savedAmountPaise,
                  challenge.targetAmountPaise,
                ) * 100,
              )}
              cta="Continue"
              onPress={() => router.push('/challenge')}
            />
          ) : challenge && status === 'completed' ? (
            <HomeChallengeCard
              eyebrow="CHALLENGE COMPLETE"
              title={`${formatRupees(challenge.savedAmountPaise)} saved`}
              savedLabel={`🔥 ${challenge.currentStreak} day streak`}
              streakLabel={`${challenge.xp} XP`}
              percent={100}
              cta="View Achievement"
              onPress={() => router.push('/challenge/complete')}
            />
          ) : challenge && status === 'expired' ? (
            <HomeChallengeCard
              eyebrow="EXPIRED"
              title={challenge.title}
              savedLabel={`${formatRupees(challenge.savedAmountPaise)} of ${formatRupees(challenge.targetAmountPaise)}`}
              streakLabel={`🔥 ${challenge.currentStreak} day streak`}
              percent={Math.round(
                calculateProgressRatio(
                  challenge.savedAmountPaise,
                  challenge.targetAmountPaise,
                ) * 100,
              )}
              cta="Continue"
              onPress={() => router.push('/challenge')}
            />
          ) : (
            <ChallengeEntryCard onPress={() => router.push('/challenge/create')} />
          )}
        </View>

        <Text style={styles.support}>One challenge at a time.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeChallengeCard({
  eyebrow,
  title,
  savedLabel,
  streakLabel,
  percent,
  cta,
  onPress,
}: {
  eyebrow: string;
  title: string;
  savedLabel: string;
  streakLabel: string;
  percent: number;
  cta: string;
  onPress: () => void;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percent, {
      duration: 480,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <Animated.View entering={FadeInDown.duration(420)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cta}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <Text style={styles.cardEyebrow}>{eyebrow}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`Challenge progress: ${percent} percent`}
          style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
        <Text style={styles.cardMeta}>
          {savedLabel} · {percent}%
        </Text>
        <Text style={styles.cardMeta}>{streakLabel}</Text>
        <View style={styles.cardCta}>
          <Text style={styles.cardCtaLabel}>{cta}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  brandMark: {
    width: 28,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
  },
  brand: {
    ...typography.screenTitle,
    fontSize: 28,
    lineHeight: 34,
  },
  tagline: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  greeting: {
    ...typography.heroAmount,
    fontSize: 28,
    lineHeight: 36,
  },
  greetingSupport: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  section: {
    width: '100%',
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
  support: {
    ...typography.caption,
    marginTop: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.xl,
  },
  cardEyebrow: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.screenTitle,
    fontSize: 22,
    lineHeight: 28,
    marginBottom: spacing.lg,
  },
  track: {
    height: 10,
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  cardMeta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cardCta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  cardCtaLabel: {
    ...typography.button,
    color: colors.primaryDark,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
