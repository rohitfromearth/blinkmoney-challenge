import { Share } from 'react-native';

import type { Challenge } from './types';
import { formatRupees } from './utils';

export function buildChallengeShareMessage(challenge: Challenge): string {
  const amount = formatRupees(challenge.savedAmountPaise);
  const streak = challenge.currentStreak;

  return [
    `I just completed my ${amount} savings challenge in ${challenge.durationDays} days with BlinkMoney! 🔥`,
    '',
    `I maintained a ${streak}-day streak and saved ${amount}.`,
    '',
    'Can you beat my streak?',
  ].join('\n');
}

export async function shareChallengeAchievement(challenge: Challenge): Promise<void> {
  try {
    await Share.share({
      message: buildChallengeShareMessage(challenge),
    });
  } catch {
    // Share sheet unavailable or failed. Stay on the completion screen.
  }
}
