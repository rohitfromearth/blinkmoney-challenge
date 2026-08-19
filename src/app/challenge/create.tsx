import { useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChallenge } from '@/features/challenge/ChallengeProvider';
import type { Challenge, ChallengePurpose } from '@/features/challenge/types';
import {
  addDays,
  calculateDailyTarget,
  formatRupees,
  getTodayDate,
  validateChallengeDraft,
} from '@/features/challenge/utils';
import { colors, radius, spacing, typography } from '@/theme';

const PURPOSE_OPTIONS: { value: ChallengePurpose; label: string }[] = [
  { value: 'emergency', label: 'Emergency fund' },
  { value: 'travel', label: 'Travel' },
  { value: 'gadget', label: 'New gadget' },
  { value: 'custom', label: 'Something else' },
];

const TARGET_PRESETS_PAISE = [100_000, 500_000, 1_000_000] as const;
const DURATION_OPTIONS = [7, 14, 30, 60] as const;

const PURPOSE_TITLES: Record<ChallengePurpose, string> = {
  emergency: 'Emergency Fund',
  travel: 'Travel',
  gadget: 'New Gadget',
  custom: 'Personal Goal',
};

function rupeesDigitsToPaise(text: string): number {
  const digits = text.replace(/\D/g, '');
  if (!digits) {
    return 0;
  }
  return Number(digits) * 100;
}

function createChallengeId(): string {
  return `challenge_${Date.now().toString(36)}`;
}

export default function CreateChallengeScreen() {
  const router = useRouter();
  const { setChallenge } = useChallenge();
  const [purpose, setPurpose] = useState<ChallengePurpose>('emergency');
  const [selectedPresetPaise, setSelectedPresetPaise] = useState<number>(500_000);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customRupees, setCustomRupees] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const targetAmountPaise = isCustomAmount
    ? rupeesDigitsToPaise(customRupees)
    : selectedPresetPaise;

  const draft = useMemo(
    () => ({ purpose, targetAmountPaise, durationDays }),
    [purpose, targetAmountPaise, durationDays],
  );

  const errors = validateChallengeDraft(draft);
  const targetError = errors.find((error) => error.includes('Target amount'));
  const durationError = errors.find((error) => error.includes('Duration'));
  const purposeError = errors.find((error) => error.includes('Purpose'));
  const isValid = errors.length === 0;

  const dailyTargetPaise = isValid
    ? calculateDailyTarget(targetAmountPaise, durationDays)
    : null;

  function dismissKeyboard() {
    Keyboard.dismiss();
  }

  function onSelectPurpose(value: ChallengePurpose) {
    dismissKeyboard();
    setPurpose(value);
  }

  function onSelectPreset(amountPaise: number) {
    dismissKeyboard();
    setIsCustomAmount(false);
    setSelectedPresetPaise(amountPaise);
  }

  function onSelectCustom() {
    setIsCustomAmount(true);
  }

  function onSelectDuration(days: number) {
    dismissKeyboard();
    setDurationDays(days);
  }

  function onStartChallenge() {
    if (submitting) {
      return;
    }

    dismissKeyboard();
    const nextErrors = validateChallengeDraft(draft);
    if (nextErrors.length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const startDate = getTodayDate();
      const challenge: Challenge = {
        id: createChallengeId(),
        title: PURPOSE_TITLES[purpose],
        purpose,
        targetAmountPaise,
        savedAmountPaise: 0,
        durationDays,
        startDate,
        endDate: addDays(startDate, durationDays - 1),
        dailyTargetPaise: calculateDailyTarget(targetAmountPaise, durationDays),
        currentStreak: 0,
        longestStreak: 0,
        xp: 0,
        status: 'active',
        lastCheckInDate: null,
      };

      setChallenge(challenge);
      router.replace('/challenge');
    } catch (error) {
      setSubmitting(false);
      throw error;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.back, pressed && styles.backPressed]}>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>

          <Text style={styles.title}>Create your challenge</Text>

          <Text style={styles.sectionLabel}>Choose what you're saving for</Text>
          <View style={styles.wrapRow}>
            {PURPOSE_OPTIONS.map((option) => {
              const selected = purpose === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  onPress={() => onSelectPurpose(option.value)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.chipPressed,
                  ]}>
                  <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {purposeError ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {purposeError}
            </Text>
          ) : null}

          <Text style={styles.sectionLabel}>How much do you want to save?</Text>
          <View style={styles.wrapRow}>
            {TARGET_PRESETS_PAISE.map((amountPaise) => {
              const selected = !isCustomAmount && selectedPresetPaise === amountPaise;
              const label = formatRupees(amountPaise);
              return (
                <Pressable
                  key={amountPaise}
                  accessibilityRole="button"
                  accessibilityLabel={`Target ${label}`}
                  accessibilityState={{ selected }}
                  onPress={() => onSelectPreset(amountPaise)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.chipPressed,
                  ]}>
                  <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Custom amount"
              accessibilityState={{ selected: isCustomAmount }}
              onPress={onSelectCustom}
              style={({ pressed }) => [
                styles.chip,
                isCustomAmount && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}>
              <Text style={[styles.chipLabel, isCustomAmount && styles.chipLabelSelected]}>
                Custom amount
              </Text>
            </Pressable>
          </View>
          {isCustomAmount ? (
            <TextInput
              accessibilityLabel="Custom target amount in rupees"
              value={customRupees}
              onChangeText={(text) => setCustomRupees(text.replace(/\D/g, ''))}
              keyboardType="numeric"
              placeholder="Enter amount in ₹"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          ) : null}
          {targetError ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {targetError}
            </Text>
          ) : null}

          <Text style={styles.sectionLabel}>Challenge duration</Text>
          <View style={styles.wrapRow}>
            {DURATION_OPTIONS.map((days) => {
              const selected = durationDays === days;
              const label = `${days} days`;
              return (
                <Pressable
                  key={days}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected }}
                  onPress={() => onSelectDuration(days)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.chipPressed,
                  ]}>
                  <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {durationError ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {durationError}
            </Text>
          ) : null}

          <View style={styles.summary}>
            <Text style={styles.summaryEyebrow}>YOUR DAILY TARGET</Text>
            <Text style={styles.summaryAmount}>
              {dailyTargetPaise === null ? '—' : `${formatRupees(dailyTargetPaise)} / day`}
            </Text>
            <Text style={styles.summaryCopy}>What you save each day.</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start Challenge"
            accessibilityState={{ disabled: !isValid || submitting }}
            disabled={!isValid || submitting}
            onPress={onStartChallenge}
            style={({ pressed }) => [
              styles.cta,
              (!isValid || submitting) && styles.ctaDisabled,
              pressed && isValid && !submitting && styles.ctaPressed,
            ]}>
            <Text style={styles.ctaLabel}>
              {submitting ? 'Starting…' : 'Start Challenge'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
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
  title: {
    ...typography.screenTitle,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.sectionTitle,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.button,
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipLabelSelected: {
    color: colors.primaryDark,
  },
  input: {
    marginTop: spacing.md,
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textOnLight,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  summary: {
    marginTop: spacing.xxl,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    padding: spacing.xl,
  },
  summaryEyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  summaryAmount: {
    ...typography.heroAmount,
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 40,
  },
  summaryCopy: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    opacity: 0.8,
  },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  ctaLabel: {
    ...typography.button,
    color: colors.primaryDark,
  },
  chipPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  backPressed: {
    opacity: 0.7,
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.primaryPressed,
  },
  pressed: {
    opacity: 0.88,
  },
});
