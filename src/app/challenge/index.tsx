import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useChallenge } from '@/features/challenge/ChallengeProvider';
import type { Challenge, ChallengePurpose } from '@/features/challenge/types';
import {
  calculateNextStreak,
  calculateProgressRatio,
  calculateRemainingAmount,
  calculateRemainingDays,
  formatRupees,
  getTodayDate,
  resolveChallengeStatus,
} from '@/features/challenge/utils';
import { colors, radius, spacing, typography } from '@/theme';

const PURPOSE_LABELS: Record<ChallengePurpose, string> = {
  emergency: 'Emergency fund',
  travel: 'Travel',
  gadget: 'New gadget',
  custom: 'Something else',
};

const CHECK_IN_XP = 100;

export default function ChallengeScreen() {
  const router = useRouter();
  const { challenge, updateChallenge } = useChallenge();
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title}>No active challenge</Text>
          <Text style={styles.copy}>No challenge yet.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start challenge"
            onPress={() => router.push('/challenge/create')}
            style={({ pressed }) => [styles.cta, pressed && styles.pressedCta]}>
            <Text style={styles.ctaLabel}>Start challenge</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const today = getTodayDate();
  const status = resolveChallengeStatus(challenge, today);
  const progress = calculateProgressRatio(
    challenge.savedAmountPaise,
    challenge.targetAmountPaise,
  );
  const percent = Math.round(progress * 100);
  const remainingPaise = calculateRemainingAmount(
    challenge.savedAmountPaise,
    challenge.targetAmountPaise,
  );
  const remainingDays = calculateRemainingDays(challenge.endDate, today);
  const checkedInToday = challenge.lastCheckInDate === today;
  const canCheckIn = status === 'active' && !checkedInToday;

  function onCheckIn() {
    if (!canCheckIn) {
      return;
    }

    const checkInDate = getTodayDate();
    let completedThisCheckIn = false;

    updateChallenge((current) => {
      if (current.lastCheckInDate === checkInDate) {
        return current;
      }
      if (resolveChallengeStatus(current, checkInDate) !== 'active') {
        return current;
      }

      const savedAmountPaise = Math.min(
        current.savedAmountPaise + current.dailyTargetPaise,
        current.targetAmountPaise,
      );
      const currentStreak = calculateNextStreak(
        current.currentStreak,
        current.lastCheckInDate,
        checkInDate,
      );
      const next: Challenge = {
        ...current,
        savedAmountPaise,
        currentStreak,
        longestStreak: Math.max(current.longestStreak, currentStreak),
        xp: current.xp + CHECK_IN_XP,
        lastCheckInDate: checkInDate,
      };
      const resolved: Challenge = {
        ...next,
        status: resolveChallengeStatus(next, checkInDate),
      };
      completedThisCheckIn = resolved.status === 'completed';
      return resolved;
    });

    setJustCheckedIn(true);
    if (completedThisCheckIn) {
      router.replace('/challenge/complete');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Text style={styles.backLabel}>← Challenge</Text>
        </Pressable>

        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{PURPOSE_LABELS[challenge.purpose]}</Text>
        </View>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.copy}>
          Save {formatRupees(challenge.targetAmountPaise)} in {challenge.durationDays} days
        </Text>

        {status === 'completed' ? (
          <View style={styles.completeCard}>
            <Text style={styles.completeTitle}>Challenge complete!</Text>
            <Text style={styles.completeCopy}>
              {formatRupees(challenge.savedAmountPaise)} saved
            </Text>
          </View>
        ) : null}

        {status === 'expired' ? (
          <View style={styles.expiredCard}>
            <Text style={styles.completeTitle}>Challenge expired</Text>
            <Text style={styles.completeCopy}>
              You saved {formatRupees(challenge.savedAmountPaise)} of{' '}
              {formatRupees(challenge.targetAmountPaise)}.
            </Text>
            <Text style={styles.completeCopy}>Your progress is still yours.</Text>
          </View>
        ) : null}

        <Text style={styles.heroAmount}>{formatRupees(challenge.savedAmountPaise)}</Text>
        <Text style={styles.copy}>of {formatRupees(challenge.targetAmountPaise)}</Text>

        <AnimatedProgressBar
          percent={percent}
          accessibilityLabel={`Challenge progress: ${percent} percent`}
        />
        <Text style={styles.percent}>{percent}% complete</Text>
        <Text style={styles.remaining}>{formatRupees(remainingPaise)} left</Text>

        <View style={styles.stats}>
          <StreakLabel streak={challenge.currentStreak} />
          <Text style={styles.stat}>
            {remainingDays} {remainingDays === 1 ? 'day' : 'days'} left
          </Text>
          <Text style={styles.stat}>{challenge.xp} XP</Text>
        </View>

        {status === 'active' ? (
          <View style={styles.todayCard}>
            <Text style={[styles.todayEyebrow, checkedInToday && styles.todayEyebrowDone]}>
              {checkedInToday ? "✓ TODAY'S GOAL COMPLETE" : "TODAY'S GOAL"}
            </Text>
            <Text style={styles.todayAmount}>{formatRupees(challenge.dailyTargetPaise)}</Text>

            {checkedInToday ? (
              <>
                <Text style={styles.done}>Come back tomorrow to continue your streak.</Text>
                <StreakLabel streak={challenge.currentStreak} />
              </>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Check in"
                onPress={onCheckIn}
                style={({ pressed }) => [styles.cta, pressed && styles.pressedCta]}>
                <Text style={styles.ctaLabel}>Check in</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {justCheckedIn && checkedInToday ? (
          <Animated.View entering={FadeInDown.duration(320)} style={styles.successCard}>
            <Text style={styles.successTitle}>✓ Saved today</Text>
            <Text style={styles.successLine}>+{formatRupees(challenge.dailyTargetPaise)}</Text>
            <Text style={styles.successLine}>🔥 Streak {challenge.currentStreak}</Text>
            <Text style={styles.successLine}>+{CHECK_IN_XP} XP</Text>
          </Animated.View>
        ) : null}

        <Text style={styles.footerTitle}>Come back tomorrow.</Text>
        <Text style={styles.copy}>Check in once a day.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function AnimatedProgressBar({
  percent,
  accessibilityLabel,
}: {
  percent: number;
  accessibilityLabel: string;
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
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

function StreakLabel({ streak }: { streak: number }) {
  const scale = useSharedValue(1);
  const previous = useRef(streak);

  useEffect(() => {
    if (streak > previous.current) {
      scale.value = withSequence(
        withTiming(1.06, { duration: 140 }),
        withTiming(1, { duration: 180 }),
      );
    }
    previous.current = streak;
  }, [scale, streak]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.stat, animatedStyle]}>🔥 {streak} day streak</Animated.Text>
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
    paddingBottom: spacing.xxxl,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  backLabel: {
    ...typography.button,
    color: colors.primary,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  title: {
    ...typography.screenTitle,
    marginBottom: spacing.xs,
  },
  copy: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  heroAmount: {
    ...typography.heroAmount,
    marginTop: spacing.xl,
  },
  track: {
    height: 12,
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  percent: {
    ...typography.sectionTitle,
    marginTop: spacing.md,
  },
  remaining: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  stats: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  stat: {
    ...typography.sectionTitle,
  },
  todayCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  todayEyebrow: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  todayEyebrowDone: {
    color: colors.success,
  },
  todayAmount: {
    ...typography.heroAmount,
    fontSize: 32,
    lineHeight: 40,
    marginBottom: spacing.lg,
  },
  done: {
    ...typography.sectionTitle,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  successCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.sectionTitle,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  successLine: {
    ...typography.body,
    color: colors.textPrimary,
  },
  completeCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  expiredCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  completeTitle: {
    ...typography.sectionTitle,
    marginBottom: spacing.sm,
  },
  completeCopy: {
    ...typography.body,
    color: colors.textPrimary,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  ctaLabel: {
    ...typography.button,
    color: colors.primaryDark,
  },
  footerTitle: {
    ...typography.sectionTitle,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  pressed: {
    opacity: 0.88,
  },
  pressedCta: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.primaryPressed,
  },
});
