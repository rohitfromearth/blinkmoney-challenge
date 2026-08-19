import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '@/theme';

interface ChallengeEntryCardProps {
  onPress: () => void;
}

export function ChallengeEntryCard({ onPress }: ChallengeEntryCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(420)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start challenge"
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
          pressed && styles.cardScaled,
        ]}>
        <View style={styles.topRow}>
          <View style={styles.mark} accessibilityElementsHidden>
            <View style={styles.ring} />
            <View style={styles.ringFill} />
          </View>
          <View style={styles.accentBar} accessibilityElementsHidden />
        </View>

        <Text style={styles.eyebrow}>SAVINGS CHALLENGE</Text>
        <Text style={styles.title}>Set a target. Hit it.</Text>
        <Text style={styles.copy}>Pick an amount. Check in daily.</Text>

        <View style={styles.cta}>
          <Text style={styles.ctaLabel}>Start challenge</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.xl,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardScaled: {
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  mark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 5,
    borderColor: colors.primaryDark,
  },
  ringFill: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  accentBar: {
    width: 36,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  eyebrow: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 22,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  copy: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  ctaLabel: {
    ...typography.button,
    color: colors.primaryDark,
  },
});
