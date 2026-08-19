import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AchievementCard } from '@/components/challenge/AchievementCard';
import { useChallenge } from '@/features/challenge/ChallengeProvider';
import { shareChallengeAchievement } from '@/features/challenge/share';
import { formatRupees, getTodayDate, resolveChallengeStatus } from '@/features/challenge/utils';
import { colors, radius, spacing, typography } from '@/theme';

export default function ChallengeCompleteScreen() {
  const router = useRouter();
  const { challenge, clearChallenge } = useChallenge();
  const [sharing, setSharing] = useState(false);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back to Home"
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <Text style={styles.backLabel}>←</Text>
          </Pressable>
          <Text style={styles.title}>No challenge to celebrate yet</Text>
          <Text style={styles.copy}>
            Complete a savings challenge to unlock this achievement.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryLabel}>Go to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completedChallenge = challenge;
  const status = resolveChallengeStatus(completedChallenge, getTodayDate());
  if (status !== 'completed') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back to Challenge"
            onPress={() => router.replace('/challenge')}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <Text style={styles.backLabel}>←</Text>
          </Pressable>
          <Text style={styles.title}>Your challenge is still in progress.</Text>
          <Text style={styles.copy}>Keep checking in to reach your target.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Challenge"
            onPress={() => router.replace('/challenge')}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
            <Text style={styles.ctaLabel}>Back to Challenge</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function onShare() {
    if (sharing) {
      return;
    }
    setSharing(true);
    try {
      await shareChallengeAchievement(completedChallenge);
    } finally {
      setSharing(false);
    }
  }

  function onStartAnother() {
    clearChallenge();
    router.replace('/challenge/create');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to Home"
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Text style={styles.backLabel}>←</Text>
        </Pressable>

        <Animated.Text
          entering={FadeIn.duration(220)}
          style={styles.celebration}
          accessibilityElementsHidden>
          🎉
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(280).delay(40)} style={styles.heroBlock}>
          <Text style={styles.kicker}>CHALLENGE COMPLETE</Text>
          <Text style={styles.headline}>Target hit.</Text>
          <Text
            accessibilityRole="header"
            accessibilityLabel={`${formatRupees(challenge.savedAmountPaise)} saved`}
            style={styles.heroAmount}>
            {formatRupees(challenge.savedAmountPaise)}
          </Text>
          <Text style={styles.savedLabel}>SAVED</Text>
          <Text style={styles.copy}>
            {challenge.title} in {challenge.durationDays} days
          </Text>
          <Text style={styles.stat}>🔥 {challenge.currentStreak} day streak</Text>
          <Text style={styles.stat}>+{challenge.xp} XP</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(280).delay(160)} style={styles.cardWrap}>
          <AchievementCard
            title={challenge.title}
            amountLabel={formatRupees(challenge.savedAmountPaise)}
            streak={challenge.currentStreak}
            xp={challenge.xp}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(260).delay(280)} style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share Achievement"
            accessibilityState={{ disabled: sharing }}
            disabled={sharing}
            onPress={onShare}
            style={({ pressed }) => [
              styles.cta,
              sharing && styles.disabled,
              pressed && !sharing && styles.ctaPressed,
            ]}>
            <Text style={styles.ctaLabel}>{sharing ? 'Opening share…' : 'Share Achievement'}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start Another Challenge"
            onPress={onStartAnother}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryLabel}>Start Another Challenge</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'center',
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  backLabel: {
    ...typography.button,
    fontSize: 22,
    color: colors.primary,
  },
  heroBlock: {
    width: '100%',
    alignItems: 'center',
  },
  actions: {
    width: '100%',
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.primaryPressed,
  },
  celebration: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  kicker: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  headline: {
    ...typography.screenTitle,
    marginBottom: spacing.lg,
  },
  heroAmount: {
    ...typography.heroAmount,
  },
  savedLabel: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  copy: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.screenTitle,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stat: {
    ...typography.sectionTitle,
    marginBottom: spacing.xs,
  },
  cardWrap: {
    width: '100%',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  cta: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  ctaLabel: {
    ...typography.button,
    color: colors.primaryDark,
  },
  secondary: {
    width: '100%',
    marginTop: spacing.md,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryLabel: {
    ...typography.button,
    color: colors.textPrimary,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.88,
  },
});
